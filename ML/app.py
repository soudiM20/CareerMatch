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
    model = TfidfVectorizer(max_features=20000, stop_words="english", ngram_range=(1, 2))
    return data.reset_index(drop=True), model, model.fit_transform(data["combined_text"])

df, vectorizer, tfidf_matrix = load_pipeline()

def candidate_text(profile):
    skills = profile.get("skills", [])
    sectors = profile.get("sectorOfInterest", [])
    education = profile.get("education", [])
    education_text = " ".join(f"{entry.get('degree', '')} {entry.get('fieldOfStudy', '')}" for entry in education)
    return " ".join([" ".join(skills)] * 3 + [" ".join(sectors), education_text]).strip()

def explain_skills(candidate_skills, required_skills):
    candidate = {canonical_skill(skill) for skill in candidate_skills if canonical_skill(skill)}
    matched, partial, missing = [], [], []
    for skill in required_skills:
        if skill in candidate:
            matched.append(skill)
        elif any(item in skill or skill in item for item in candidate):
            partial.append(skill)
        else:
            missing.append(skill)
    coverage = 0 if not required_skills else round((len(matched) + 0.5 * len(partial)) / len(required_skills) * 100)
    return matched, partial, missing, coverage

def includes(value, search):
    return not search or search.lower() in str(value).lower()

def apply_filters(data, profile, filters):
    preferences = profile.get("preferences", {})
    role = filters.get("role") or ""
    location = filters.get("location") or preferences.get("locationPref", "")
    mode = filters.get("work_mode") or preferences.get("mode", "")
    filtered = data.copy()
    if role:
        filtered = filtered[filtered.apply(lambda row: any(includes(row.get(key, ""), role) for key in ("Internship_Title", "Area_Field", "Sector")), axis=1)]
    if location:
        filtered = filtered[filtered["Internship_State"].fillna("").map(lambda value: includes(value, location.split(",")[0].strip()))]
    if mode:
        filtered = filtered[filtered["Mode"].fillna("").map(lambda value: includes(value, mode))]
    wanted_skills = parse_skills(filters.get("required_skills", ""))
    if wanted_skills:
        filtered = filtered[filtered["Required_Skills"].map(lambda value: any(item in parse_skills(value) for item in wanted_skills))]
    return filtered if not filtered.empty else data.copy()  # preferences are soft filters

@app.get("/")
def home():
    return {"message": "CareerMatch recommendation API is running"}

@app.post("/recommend_candidate")
def recommend_candidate():
    payload = request.get_json(silent=True) or {}
    profile, filters = payload.get("profile") or {}, payload.get("filters") or {}
    top_k = max(1, min(int(payload.get("top_k", 20)), 50))
    candidate_skills = profile.get("skills") or []
    if not profile or not candidate_skills:
        return jsonify({"ids": [], "recommendations": [], "message": "A profile with at least one skill is required."}), 400
    filtered = apply_filters(df, profile, filters)
    similarities = cosine_similarity(vectorizer.transform([candidate_text(profile)]), tfidf_matrix[filtered.index]).flatten()
    preferences = profile.get("preferences", {})
    candidate_fields = [item.get("fieldOfStudy") for item in profile.get("education", []) if item.get("fieldOfStudy")]
    results = []
    for position, (_, row) in enumerate(filtered.iterrows()):
        required = parse_skills(row.get("Required_Skills", ""))
        matched, partial, missing, coverage = explain_skills(candidate_skills, required)
        relevance = round(float(similarities[position]) * 100)
        preference_fit = (5 if preferences.get("mode") and includes(row.get("Mode", ""), preferences["mode"]) else 0) + (5 if preferences.get("locationPref") and includes(row.get("Internship_State", ""), preferences["locationPref"].split(",")[0]) else 0)
        score = round(0.70 * coverage + 0.20 * relevance + preference_fit)
        results.append({
            "internship_id": str(row.get("Internship_ID")), "match_score": max(0, min(score, 100)), "skill_coverage": coverage,
            "matched_skills": matched, "partially_matched_skills": partial, "missing_skills": missing,
            "relevant_candidate_attributes": {"skills": candidate_skills, "sectors": profile.get("sectorOfInterest", []), "education_fields": candidate_fields, "preferred_mode": preferences.get("mode"), "preferred_location": preferences.get("locationPref")},
            "recommendation_reason": f"Strong alignment with {len(matched)} of {len(required)} core required skills." if required else "Recommended from the role, sector, and profile-text similarity.",
        })
    minimum = float(filters.get("min_match_score") or 0)
    results = [result for result in results if result["match_score"] >= minimum]
    results.sort(key=lambda result: (result["match_score"], result["skill_coverage"]), reverse=True)
    results = results[:top_k]
    return jsonify({"ids": [result["internship_id"] for result in results], "recommendations": results})

if __name__ == "__main__":
    app.run(debug=True, port=5001)
