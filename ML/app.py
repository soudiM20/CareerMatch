"""CareerMatch recommendation service with CV-aware hybrid scoring."""
from __future__ import annotations

from io import BytesIO
from pathlib import Path
import os
import re
import hmac

import pandas as pd
from flask import Flask, jsonify, request
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover
    PdfReader = None

try:
    import pytesseract
except ImportError:  # pragma: no cover
    pytesseract = None

try:
    from pdf2image import convert_from_bytes
except ImportError:  # pragma: no cover
    convert_from_bytes = None


app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent

env_path = BASE_DIR.parent / "Backend" / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            if "=" in line and not line.startswith("#"):
                key, val = line.strip().split("=", 1)
                if key == "FLASK_SERVICE_TOKEN":
                    os.environ[key] = val

SERVICE_TOKEN = os.environ.get("FLASK_SERVICE_TOKEN")
DATA_PATH = BASE_DIR / "internship.csv"

ALGORITHM_VERSION = "cv-hybrid-tfidf-v1"
SCORE_WEIGHTS_VERSION = "skill55-relevance20-pref10-cv10-cvsem5-v1"
PDF_MAGIC_BYTES = b"%PDF-"

SKILL_ALIASES = {
    "python": {"python", "py"},
    "javascript": {"javascript", "js", "ecmascript"},
    "typescript": {"typescript", "ts"},
    "react": {"react", "reactjs", "react.js"},
    "node.js": {"node.js", "nodejs", "node js", "node"},
    "sql": {"sql", "mysql", "postgresql", "postgres", "sqlite"},
    "mongodb": {"mongo", "mongodb"},
    "machine learning": {"machine learning", "ml", "ml model", "ml models"},
    "data analysis": {"data analysis", "data analytics", "analytics"},
    "c++": {"c++", "cpp"},
    "c": {"c"},
    "java": {"java"},
    "html": {"html"},
    "css": {"css"},
    "excel": {"excel"},
    "power bi": {"power bi", "powerbi"},
    "aws": {"aws", "amazon web services"},
    "docker": {"docker"},
    "kubernetes": {"kubernetes", "k8s"},
    "git": {"git", "github"},
    "tables": {"tables"},
    "communication": {"communication"},
    "research": {"research", "research skills"},
}

SECTION_HINTS = {
    "skills": ["skills", "technical skills", "core skills", "tools", "technologies", "technologies & tools"],
    "education": ["education", "academic background", "qualification", "qualifications"],
    "experience": ["experience", "work experience", "professional experience"],
    "projects": ["projects", "project work", "key projects"],
    "certifications": ["certifications", "licenses", "courses", "training"],
}


def normalize(value):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9+#.]+", " ", str(value).lower())).strip()


def canonical_skill(skill):
    value = normalize(skill)
    if not value:
        return ""
    for name, aliases in SKILL_ALIASES.items():
        if value in aliases:
            return name
    return value


def parse_skills(value):
    if isinstance(value, list):
        values = value
    elif pd.isna(value):
        values = []
    else:
        values = re.split(r"[;,|/\n]", str(value))
    return [canonical_skill(item) for item in values if normalize(item)]


def _tokens(skill):
    return {token for token in normalize(skill).split(" ") if token}


def explain_skills(candidate_skills, required_skills):
    candidate = {canonical_skill(skill) for skill in candidate_skills if canonical_skill(skill)}
    matched, partial, missing = [], [], []
    for skill in required_skills:
        if skill in candidate:
            matched.append(skill)
        elif any(_tokens(skill) & _tokens(item) for item in candidate):
            partial.append(skill)
        else:
            missing.append(skill)
    coverage = 0 if not required_skills else round((len(matched) + 0.5 * len(partial)) / len(required_skills) * 100)
    return matched, partial, missing, coverage


def _dedupe_ordered(items):
    seen = set()
    ordered = []
    for item in items:
        clean = normalize(item)
        if not clean or clean in seen:
            continue
        seen.add(clean)
        ordered.append(item.strip())
    return ordered


def clean_cv_text(text):
    if not text:
        return ""
    cleaned = text.replace("\r", "\n")
    cleaned = re.sub(r"[\u00a0\u200b\u200c\u200d]", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    cleaned = re.sub(r"\n +", "\n", cleaned)
    cleaned = re.sub(r"(?<!\n)\n(?=[A-Z][A-Za-z0-9 &/.-]{2,}:)", "\n", cleaned)
    return cleaned.strip()


def extract_cv_skills(text):
    normalized = clean_cv_text(text)
    if not normalized:
        return []
    skill_hits = []
    for skill_name, aliases in SKILL_ALIASES.items():
        alias_pattern = r"|".join(re.escape(alias) for alias in sorted(aliases, key=len, reverse=True))
        pattern = rf"(?i)(?<![a-z0-9])(?:{alias_pattern})(?![a-z0-9])"
        if re.search(pattern, normalized):
            skill_hits.append(skill_name)
    if not skill_hits:
        for line in normalized.splitlines():
            candidate = line.strip()
            if 2 <= len(candidate.split()) <= 6 and any(token.isalpha() for token in candidate.split()):
                skill_hits.append(canonical_skill(candidate))
    return _dedupe_ordered(skill_hits)


def extract_cv_education(text):
    normalized = clean_cv_text(text)
    matches = []
    for pattern in [
        r"(?i)\b(B\.?(?:Tech|E|Sc|A|Com|BA|B\.E)|M\.?(?:Tech|Sc|BA|Com)|MBA|MS|Ph\.?(?:D|d)|Diploma)\b.*?(?:\n|$)",
        r"(?i)\b(?:Computer Science|Information Technology|Mechanical Engineering|Electrical Engineering|Civil Engineering|Electronics|Mathematics|Statistics|Chemistry|Biotechnology|Business Administration|Marketing|Communication)\b.*?(?:\n|$)",
    ]:
        for line in normalized.splitlines():
            if re.search(pattern, line):
                matches.append(line.strip())
    return _dedupe_ordered(matches)


def extract_cv_experience(text):
    normalized = clean_cv_text(text)
    entries = []
    for line in normalized.splitlines():
        if re.search(r"(?i)\b(intern|developer|engineer|analyst|assistant|associate|trainee|consultant|executive|researcher|internship|freelance)\b", line):
            entries.append(line.strip())
    return _dedupe_ordered(entries[:8])


def extract_cv_projects(text):
    normalized = clean_cv_text(text)
    projects = []
    for line in normalized.splitlines():
        if re.search(r"(?i)\b(project|portfolio|app|dashboard|website|ml model|system)\b", line) and len(line.split()) >= 4:
            projects.append(line.strip())
    return _dedupe_ordered(projects[:8])


def extract_cv_certifications(text):
    normalized = clean_cv_text(text)
    certs = []
    for line in normalized.splitlines():
        if re.search(r"(?i)\b(certification|certified|coursera|aws|google|nptel|udemy|microsoft|azure|oracle)\b", line):
            certs.append(line.strip())
    return _dedupe_ordered(certs[:8])


def extract_cv_analysis(raw_text):
    text = clean_cv_text(raw_text or "")
    if not text:
        return {"status": "empty", "skills": [], "education": [], "experience": [], "projects": [], "certifications": [], "textLength": 0}
    skills = extract_cv_skills(text)
    analysis = {
        "status": "success",
        "skills": skills,
        "education": extract_cv_education(text),
        "experience": extract_cv_experience(text),
        "projects": extract_cv_projects(text),
        "certifications": extract_cv_certifications(text),
        "textLength": len(text),
        "modelVersion": ALGORITHM_VERSION,
    }
    return analysis


def extract_pdf_text(pdf_bytes):
    if not pdf_bytes or len(pdf_bytes) < len(PDF_MAGIC_BYTES):
        return ""
    if pdf_bytes[:len(PDF_MAGIC_BYTES)] != PDF_MAGIC_BYTES:
        raise ValueError("Uploaded file is not a valid PDF")
    if PdfReader is None:
        return ""
    try:
        reader = PdfReader(BytesIO(pdf_bytes))
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text() or ""
            if page_text:
                text_parts.append(page_text)
        text = "\n".join(text_parts)
        if text and len(clean_cv_text(text)) > 80:
            return text
    except Exception:
        pass
    if pytesseract and convert_from_bytes:
        try:
            images = convert_from_bytes(pdf_bytes)
            ocr_text = []
            for image in images:
                ocr_text.append(pytesseract.image_to_string(image))
            combined = "\n".join(ocr_text)
            if combined and len(clean_cv_text(combined)) > 20:
                return combined
        except Exception:
            pass
    return ""


def get_profile_cv_text(profile):
    if not profile:
        return ""
    analysis = (profile or {}).get("cvAnalysis") or {}
    cv_parts = []
    for key in ("skills", "education", "experience", "projects", "certifications"):
        for item in analysis.get(key, []) or []:
            if isinstance(item, str) and item.strip():
                cv_parts.append(item)
    return " ".join(cv_parts)


def candidate_text(profile):
    raw_skills = profile.get("skills", [])
    skills = [canonical_skill(skill) for skill in raw_skills if normalize(skill)]
    sectors = profile.get("sectorOfInterest", [])
    education = profile.get("education", [])
    education_text = " ".join(f"{entry.get('degree', '')} {entry.get('fieldOfStudy', '')}" for entry in education)
    cv_text = get_profile_cv_text(profile)
    return " ".join([" ".join(skills)] * 2 + [" ".join(sectors), education_text, cv_text]).strip()


def includes(value, search):
    return not search or search.lower() in str(value).lower()


def normalize_mode(value):
    value = normalize(value).replace(" ", "-")
    return "on-site" if value in {"onsite", "on-site"} else value


def is_any_location(value):
    return normalize(value) in {"", "any", "any-location", "any location"}


def matches_location(row, location):
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


def recommendation_reason(matched, partial, missing, required, cv_similarity=0.0):
    if not required:
        return "Recommended from the role, sector, CV similarity, and profile-text relevance."
    parts = []
    if matched:
        parts.append(f"{len(matched)} exact skill match{'es' if len(matched) != 1 else ''}")
    if partial:
        parts.append(f"{len(partial)} partial skill match{'es' if len(partial) != 1 else ''}")
    if missing:
        parts.append(f"{len(missing)} skill gap{'s' if len(missing) != 1 else ''}")
    if cv_similarity > 0.6:
        parts.append("strong CV alignment")
    return "Recommendation includes " + ", ".join(parts) + "."


def load_pipeline():
    data = pd.read_csv(DATA_PATH)
    fields = ["Internship_Title", "Company_Name", "Sector", "Area_Field", "Required_Skills", "Eligibility_Education", "Benefits", "Company_Description"]
    fields = [field for field in fields if field in data.columns]
    data[fields] = data[fields].fillna("")
    data["combined_text"] = data[fields].astype(str).agg(" ".join, axis=1)
    if "Application_Deadline" in data.columns:
        data["Application_Deadline_Parsed"] = pd.to_datetime(data["Application_Deadline"], format="%d-%m-%Y", errors="coerce")
    else:
        data["Application_Deadline_Parsed"] = pd.NaT
    model = TfidfVectorizer(max_features=20000, stop_words="english", ngram_range=(1, 2))
    return data.reset_index(drop=True), model, model.fit_transform(data["combined_text"])


df, vectorizer, tfidf_matrix = load_pipeline()


def apply_filters(data, profile, filters):
    role = filters.get("role") or ""
    location = filters.get("location") or ""
    mode = normalize_mode(filters.get("work_mode") or "")

    today = pd.Timestamp.now().normalize()
    is_active = data["Application_Deadline_Parsed"].notna() & (data["Application_Deadline_Parsed"] >= today)
    filtered = data[is_active].copy()

    if role:
        filtered = filtered[filtered.apply(lambda row: any(includes(row.get(key, ""), role) for key in ("Internship_Title", "Area_Field", "Sector")), axis=1)]
    if location and not is_any_location(location):
        filtered = filtered[filtered.apply(lambda row: matches_location(row, location), axis=1)]
    if mode:
        filtered = filtered[filtered["Mode"].fillna("").map(lambda value: normalize_mode(value) == mode)]
    wanted_skills = parse_skills(filters.get("required_skills", ""))
    if wanted_skills:
        filtered = filtered[filtered["Required_Skills"].map(lambda value: all(item in parse_skills(value) for item in wanted_skills))]
    return filtered


def score_recommendation_rows(data, profile, minimum=0, top_k=20,
                              skill_weight=0.70, relevance_weight=0.20,
                              preference_scale=1.0):
    profile_skills = {canonical_skill(skill) for skill in (profile.get("skills") or []) if normalize(skill)}
    cv_analysis = profile.get("cvAnalysis") or {}
    cv_skills = {canonical_skill(skill) for skill in (cv_analysis.get("skills") or []) if normalize(skill)}
    combined_skill_set = profile_skills | cv_skills

    base_similarity = cosine_similarity(
        vectorizer.transform([candidate_text(profile)]),
        tfidf_matrix[data.index],
    ).flatten()

    cv_text = get_profile_cv_text(profile)
    cv_similarity = cosine_similarity(
        vectorizer.transform([cv_text]) if cv_text else [""],
        tfidf_matrix[data.index],
    ).flatten() if cv_text else None

    preferences = profile.get("preferences", {})
    candidate_fields = [item.get("fieldOfStudy") for item in profile.get("education", []) if item.get("fieldOfStudy")]
    results = []
    for position, (_, row) in enumerate(data.iterrows()):
        required = parse_skills(row.get("Required_Skills", ""))
        matched, partial, missing, coverage = explain_skills(combined_skill_set, required)
        cv_matched, cv_partial, cv_missing, cv_coverage = explain_skills(cv_skills, required)
        relevance = round(float(base_similarity[position]) * 100)
        cv_match_value = round(float(cv_similarity[position]) * 100) if cv_similarity is not None else 0

        preferred_mode = normalize_mode(preferences.get("mode") or "")
        preferred_location = preferences.get("locationPref") or ""
        preference_fit = (
            (3 if preferred_mode and normalize_mode(row.get("Mode", "")) == preferred_mode else 0) +
            (3 if matches_location(row, preferred_location) and not is_any_location(preferred_location) else 0) +
            (4 if duration_matches(row.get("Duration_Months"), preferences.get("duration")) else 0)
        )

        cv_adjustment = 0.10 * cv_coverage if cv_analysis.get("status") == "success" else 0
        cv_semantic_adjustment = 0.05 * cv_match_value if cv_analysis.get("status") == "success" else 0
        score = round(
            skill_weight * coverage +
            relevance_weight * relevance +
            preference_scale * preference_fit +
            cv_adjustment +
            cv_semantic_adjustment
        )
        result = {
            "internship_id": str(row.get("Internship_ID")),
            "match_score": max(0, min(score, 100)),
            "skill_coverage": coverage,
            "matched_skills": matched,
            "partially_matched_skills": partial,
            "missing_skills": missing,
            "cv_similarity": round(cv_match_value / 100, 3) if cv_analysis.get("status") == "success" else 0.0,
            "cv_skill_coverage": cv_coverage,
            "cv_matches": cv_matched,
            "relevant_candidate_attributes": {
                "skills": sorted(profile_skills),
                "cv_skills": sorted(cv_skills),
                "sectors": profile.get("sectorOfInterest", []),
                "education_fields": candidate_fields,
                "preferred_mode": preferences.get("mode"),
                "preferred_location": preferences.get("locationPref"),
            },
            "recommendation_reason": recommendation_reason(matched, partial, missing, required, cv_similarity=round(cv_match_value / 100, 3) if cv_analysis.get("status") == "success" else 0.0),
        }
        results.append(result)

    return sorted(
        (result for result in results if result["match_score"] >= minimum),
        key=lambda result: (-result["match_score"], -result["skill_coverage"], result["internship_id"]),
    )[:top_k]


@app.get("/")
def home():
    return {"message": "CareerMatch recommendation API is running"}


@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "internship_count": int(len(df)),
        "vocabulary_size": len(vectorizer.vocabulary_),
    })


@app.post("/analyze_cv")
def analyze_cv():
    if not SERVICE_TOKEN:
        return jsonify({"message": "Recommendation service authentication is not configured."}), 503
    supplied_token = request.headers.get("X-ML-Service-Token", "")
    if not hmac.compare_digest(supplied_token, SERVICE_TOKEN):
        return jsonify({"message": "Unauthorized recommendation service request."}), 401

    if "cv" not in request.files or not request.files["cv"].filename:
        return jsonify({"message": "A PDF CV is required."}), 400

    uploaded = request.files["cv"]
    pdf_bytes = uploaded.read()
    try:
        extracted = extract_pdf_text(pdf_bytes)
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400

    analysis = extract_cv_analysis(extracted)
    return jsonify(analysis)


@app.post("/recommend_candidate")
def recommend_candidate():
    if not SERVICE_TOKEN:
        return jsonify({"message": "Recommendation service authentication is not configured."}), 503
    supplied_token = request.headers.get("X-ML-Service-Token", "")
    if not hmac.compare_digest(supplied_token, SERVICE_TOKEN):
        return jsonify({"message": "Unauthorized recommendation service request."}), 401
    payload = request.get_json(silent=True) or {}
    profile, filters = payload.get("profile") or {}, payload.get("filters") or {}

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
        return jsonify({"ids": [], "recommendations": [], "message": "No matching internships found."})
    results = score_recommendation_rows(filtered, profile, minimum, top_k)
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
    app.run(debug=os.environ.get("FLASK_DEBUG") == "1", host="0.0.0.0", port=int(os.environ.get("PORT", "5001")))
