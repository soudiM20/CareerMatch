"""Small, inspectable CareerMatch recommendation service."""
from pathlib import Path
import re

import pandas as pd
from flask import Flask, jsonify, request
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "internship.csv"

# Fix (model/algorithm versioning audit): tag every response with the exact
# scoring logic that produced it, so a future "why did this user's
# recommendation change?" question can be answered by checking which version
# ran, instead of trying to reconstruct history from git blame. Bump these
# any time the scoring formula, weights, or feature construction change.
ALGORITHM_VERSION = "tfidf-cosine-v2"
SCORE_WEIGHTS_VERSION = "skill70-relevance20-preference10-v2"

SKILL_ALIASES = {
    "javascript": {"js", "javascript", "ecmascript"}, "typescript": {"ts", "typescript"},
    "python": {"python", "py"}, "postgresql": {"postgres", "postgresql"},
    "mongodb": {"mongo", "mongodb"}, "machine learning": {"ml", "machine learning"},
    "react": {"react", "reactjs", "react.js"},
}

def normalize(value):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9+#.]", " ", str(value).lower())).strip()

def canonical_skill(skill):
    value = normalize(skill)
    return next((name for name, aliases in SKILL_ALIASES.items() if value in aliases), value)

def parse_skills(value):
    values = value if isinstance(value, list) else ([] if pd.isna(value) else re.split(r"[;,|/]", str(value)))
    return [canonical_skill(item) for item in values if normalize(item)]

def load_pipeline():
    data = pd.read_csv(DATA_PATH)
    fields = ["Internship_Title", "Company_Name", "Sector", "Area_Field", "Required_Skills", "Eligibility_Education", "Benefits", "Company_Description"]
    fields = [field for field in fields if field in data.columns]
    data[fields] = data[fields].fillna("")
    data["combined_text"] = data[fields].astype(str).agg(" ".join, axis=1)
    # Fix (expired-internship audit): parse the deadline once at load time so
    # it can be compared against "now" on every request. The source CSV uses
    # DD-MM-YYYY, matching the format written by Backend/scripts/importInternships.js.
    if "Application_Deadline" in data.columns:
        data["Application_Deadline_Parsed"] = pd.to_datetime(
            data["Application_Deadline"], format="%d-%m-%Y", errors="coerce"
        )
    else:
        data["Application_Deadline_Parsed"] = pd.NaT
    model = TfidfVectorizer(max_features=20000, stop_words="english", ngram_range=(1, 2))
    return data.reset_index(drop=True), model, model.fit_transform(data["combined_text"])

df, vectorizer, tfidf_matrix = load_pipeline()

def candidate_text(profile):
    skills = profile.get("skills", [])
    sectors = profile.get("sectorOfInterest", [])
    education = profile.get("education", [])
    education_text = " ".join(f"{entry.get('degree', '')} {entry.get('fieldOfStudy', '')}" for entry in education)
    return " ".join([" ".join(skills)] * 3 + [" ".join(sectors), education_text]).strip()

def _tokens(skill):
    return set(skill.split(" ")) - {""}

def explain_skills(candidate_skills, required_skills):
    candidate = {canonical_skill(skill) for skill in candidate_skills if canonical_skill(skill)}
    matched, partial, missing = [], [], []
    for skill in required_skills:
        if skill in candidate:
            matched.append(skill)
        # Fix (skill-matching audit): the previous check (`item in skill or
        # skill in item`) was raw substring containment, which produced false
        # positives like "java" matching inside "javascript". This now
        # requires a shared whole word/token between the two normalized
        # skill phrases (e.g. "data" shared between "data analysis" and
        # "data science"), which still catches genuine partial overlaps
        # without matching unrelated skills that merely share letters.
        elif any(_tokens(skill) & _tokens(item) for item in candidate):
            partial.append(skill)
        else:
            missing.append(skill)
    coverage = 0 if not required_skills else round((len(matched) + 0.5 * len(partial)) / len(required_skills) * 100)
    return matched, partial, missing, coverage

def includes(value, search):
    return not search or search.lower() in str(value).lower()

def normalize_mode(value):
    value = normalize(value).replace(" ", "-")
    return "on-site" if value in {"onsite", "on-site"} else value

def is_any_location(value):
    return normalize(value) in {"", "any", "any-location", "any location"}

def matches_location(row, location):
    """Match city/state input against both catalog district and state."""
    if is_any_location(location):
        return True
    terms = [normalize(part) for part in str(location).split(",") if normalize(part)]
    haystack = f"{normalize(row.get('Internship_District', ''))} {normalize(row.get('Internship_State', ''))}"
    return bool(terms) and all(term in haystack for term in terms)

def duration_matches(value, preference):
    if not preference or normalize(preference) == "flexible":
        return False
    match = re.search(r"\d+", str(preference))
    if not match:
        return False
    try:
        return float(value) == float(match.group())
    except (TypeError, ValueError):
        return False

def apply_filters(data, profile, filters):
    role = filters.get("role") or ""
    # Only explicit request filters narrow the candidate set. Saved profile
    # preferences are intentionally score boosts, so a mode/location mismatch
    # never hides otherwise relevant opportunities.
    location = filters.get("location") or ""
    mode = normalize_mode(filters.get("work_mode") or "")

    # Fix (expired-internship audit): always exclude internships whose
    # application deadline has passed. Rows with an unparseable/missing
    # deadline are kept (NaT comparisons are False, so `>= today` would
    # otherwise silently drop them) since "no deadline on file" isn't the
    # same as "expired".
    today = pd.Timestamp.now().normalize()
    is_active = data["Application_Deadline_Parsed"].isna() | (data["Application_Deadline_Parsed"] >= today)
    filtered = data[is_active].copy()

    if role:
        filtered = filtered[filtered.apply(lambda row: any(includes(row.get(key, ""), role) for key in ("Internship_Title", "Area_Field", "Sector")), axis=1)]
    if location and not is_any_location(location):
        filtered = filtered[filtered.apply(lambda row: matches_location(row, location), axis=1)]
    if mode:
        filtered = filtered[filtered["Mode"].fillna("").map(lambda value: normalize_mode(value) == mode)]
    wanted_skills = parse_skills(filters.get("required_skills", ""))
    if wanted_skills:
        filtered = filtered[filtered["Required_Skills"].map(lambda value: any(item in parse_skills(value) for item in wanted_skills))]

    # Fix (empty-filter fallback bug): previously this fell back to the
    # *entire, unfiltered* dataset whenever the applied filters matched
    # nothing ("preferences are soft filters"), which silently ignored the
    # user's filters with no indication anything was dropped. Returning the
    # (possibly empty) filtered result makes "no matching internships" an
    # explicit, honest outcome instead of a silent full-catalog fallback.
    return filtered

@app.get("/")
def home():
    return {"message": "CareerMatch recommendation API is running"}

@app.get("/health")
def health():
    # Liveness/readiness check for the Node backend and any process
    # supervisor to poll. Reports whether the TF-IDF pipeline actually
    # loaded (df/vectorizer/tfidf_matrix are built once at import time above)
    # rather than just "the Flask process is up".
    return jsonify({
        "status": "ok",
        "internship_count": int(len(df)),
        "vocabulary_size": len(vectorizer.vocabulary_),
    })

@app.post("/recommend_candidate")
def recommend_candidate():
    payload = request.get_json(silent=True) or {}
    profile, filters = payload.get("profile") or {}, payload.get("filters") or {}

    # Fix (Flask input-validation audit): `int(payload.get("top_k", 20))` and
    # `float(filters.get("min_match_score") or 0)` previously ran unguarded —
    # a non-numeric value (e.g. a stray string from a malformed request)
    # raised an uncaught ValueError, which Flask turns into an opaque 500.
    # Malformed client input should be a 400, not a server error.
    try:
        top_k = max(1, min(int(payload.get("top_k", 20)), 50))
    except (TypeError, ValueError):
        return jsonify({"message": "top_k must be an integer between 1 and 50."}), 400

    try:
        minimum = float(filters.get("min_match_score") or 0)
    except (TypeError, ValueError):
        return jsonify({"message": "min_match_score must be a number."}), 400

    candidate_skills = profile.get("skills") or []
    if not profile or not candidate_skills:
        return jsonify({"ids": [], "recommendations": [], "message": "A profile with at least one skill is required."}), 400
    filtered = apply_filters(df, profile, filters)
    if filtered.empty:
        # Fix: filtering (e.g. all matching internships expired, or no
        # internship satisfies the requested filters) is a legitimate,
        # expected outcome now that apply_filters no longer silently falls
        # back to the full catalog — it must return an empty result, not 500.
        return jsonify({"ids": [], "recommendations": [], "message": "No matching internships found."})
    similarities = cosine_similarity(vectorizer.transform([candidate_text(profile)]), tfidf_matrix[filtered.index]).flatten()
    preferences = profile.get("preferences", {})
    candidate_fields = [item.get("fieldOfStudy") for item in profile.get("education", []) if item.get("fieldOfStudy")]
    results = []
    for position, (_, row) in enumerate(filtered.iterrows()):
        required = parse_skills(row.get("Required_Skills", ""))
        matched, partial, missing, coverage = explain_skills(candidate_skills, required)
        relevance = round(float(similarities[position]) * 100)
        preferred_mode = normalize_mode(preferences.get("mode") or "")
        preferred_location = preferences.get("locationPref") or ""
        preference_fit = (
            (3 if preferred_mode and normalize_mode(row.get("Mode", "")) == preferred_mode else 0) +
            (3 if matches_location(row, preferred_location) and not is_any_location(preferred_location) else 0) +
            (4 if duration_matches(row.get("Duration_Months"), preferences.get("duration")) else 0)
        )
        score = round(0.70 * coverage + 0.20 * relevance + preference_fit)
        results.append({
            "internship_id": str(row.get("Internship_ID")), "match_score": max(0, min(score, 100)), "skill_coverage": coverage,
            "matched_skills": matched, "partially_matched_skills": partial, "missing_skills": missing,
            "relevant_candidate_attributes": {"skills": candidate_skills, "sectors": profile.get("sectorOfInterest", []), "education_fields": candidate_fields, "preferred_mode": preferences.get("mode"), "preferred_location": preferences.get("locationPref")},
            "recommendation_reason": f"Strong alignment with {len(matched)} of {len(required)} core required skills." if required else "Recommended from the role, sector, and profile-text similarity.",
        })
    results = [result for result in results if result["match_score"] >= minimum]
    results.sort(key=lambda result: (result["match_score"], result["skill_coverage"]), reverse=True)
    results = results[:top_k]
    return jsonify({
        "ids": [result["internship_id"] for result in results],
        "recommendations": results,
        "algorithmVersion": ALGORITHM_VERSION,
        "scoreWeightsVersion": SCORE_WEIGHTS_VERSION,
    })

if __name__ == "__main__":
    # Fix (Flask production audit): debug=True enables the interactive
    # Werkzeug debugger, which allows arbitrary code execution if this
    # endpoint is ever reachable from outside localhost. Debug mode should
    # only be turned on locally (e.g. via a FLASK_DEBUG env var), and a real
    # deployment should run this behind a WSGI server such as Gunicorn
    # instead of `app.run()` at all.
    import os
    app.run(debug=os.environ.get("FLASK_DEBUG") == "1", port=5001)
