# Regression tests for the Stage-1 fixes in app.py.
# Usage: pip install pytest && pytest ML/test_app.py
#
# These intentionally test the two behaviors called out in the audit:
#  1. apply_filters must NOT fall back to the full dataset when nothing matches.
#  2. explain_skills must NOT treat "java" as a partial match for "javascript".

import os
os.environ.setdefault("FLASK_SERVICE_TOKEN", "test-token")
import pandas as pd
import pytest

from app import apply_filters, explain_skills, recommendation_reason, extract_cv_analysis, score_recommendation_rows, app as flask_app


@pytest.fixture
def client():
    flask_app.config.update(TESTING=True)
    with flask_app.test_client() as test_client:
        yield test_client


def _make_df():
    return pd.DataFrame([
        {
            "Internship_ID": "TEST-1",
            "Internship_Title": "Backend Intern",
            "Area_Field": "Software",
            "Sector": "IT",
            "Internship_State": "Karnataka",
            "Mode": "Remote",
            "Required_Skills": "Python; SQL",
            "Application_Deadline": "01-01-2099",
        },
        {
            "Internship_ID": "TEST-2",
            "Internship_Title": "Frontend Intern",
            "Area_Field": "Software",
            "Sector": "IT",
            "Internship_State": "Delhi",
            "Mode": "On-site",
            "Required_Skills": "React; CSS",
            "Application_Deadline": "01-01-2020",  # expired
        },
    ])


def _with_parsed_deadline(df):
    df["Application_Deadline_Parsed"] = pd.to_datetime(
        df["Application_Deadline"], format="%d-%m-%Y", errors="coerce"
    )
    return df


def test_apply_filters_returns_empty_when_nothing_matches():
    df = _with_parsed_deadline(_make_df())
    profile = {"skills": ["python"], "preferences": {}}
    filters = {"location": "Nonexistent State XYZ"}
    result = apply_filters(df, profile, filters)
    assert result.empty  # previously this fell back to the full dataset


def test_apply_filters_excludes_expired_internships():
    df = _with_parsed_deadline(_make_df())
    profile = {"skills": ["react"], "preferences": {}}
    result = apply_filters(df, profile, {})
    assert "TEST-2" not in result["Internship_ID"].values


def test_apply_filters_excludes_missing_or_invalid_deadlines():
    df = _with_parsed_deadline(_make_df())
    df.loc[len(df)] = {**_make_df().iloc[0].to_dict(), "Internship_ID": "TEST-MISSING", "Application_Deadline": None}
    df.loc[len(df)] = {**_make_df().iloc[0].to_dict(), "Internship_ID": "TEST-INVALID", "Application_Deadline": "31-02-2099"}
    df = _with_parsed_deadline(df)
    result = apply_filters(df, {"skills": ["python"], "preferences": {}}, {})
    assert "TEST-MISSING" not in result["Internship_ID"].values
    assert "TEST-INVALID" not in result["Internship_ID"].values


def test_apply_filters_keeps_active_matches():
    df = _with_parsed_deadline(_make_df())
    profile = {"skills": ["python"], "preferences": {}}
    result = apply_filters(df, profile, {"location": "Karnataka"})
    assert "TEST-1" in result["Internship_ID"].values


def test_saved_preferences_are_soft_and_any_location_is_unrestricted():
    df = _with_parsed_deadline(_make_df())
    profile = {"skills": ["python"], "preferences": {"mode": "on-site", "locationPref": "Any location"}}
    result = apply_filters(df, profile, {})
    assert "TEST-1" in result["Internship_ID"].values


def test_explicit_onsite_filter_uses_canonical_mode():
    df = _with_parsed_deadline(_make_df())
    profile = {"skills": ["react"], "preferences": {}}
    result = apply_filters(df, profile, {"work_mode": "on-site"})
    assert result.empty  # only matching on-site row is expired


def test_required_skills_filter_requires_all_requested_skills():
    df = _with_parsed_deadline(_make_df())
    result = apply_filters(df, {"skills": ["python"], "preferences": {}}, {"required_skills": "Python,SQL"})
    assert list(result["Internship_ID"]) == ["TEST-1"]

    result = apply_filters(df, {"skills": ["python"], "preferences": {}}, {"required_skills": "Python,React"})
    assert result.empty


def test_explain_skills_does_not_false_positive_java_javascript():
    matched, partial, missing, coverage = explain_skills(["java"], ["javascript"])
    assert "javascript" not in matched
    assert "javascript" not in partial
    assert "javascript" in missing


def test_explain_skills_partial_match_on_shared_token():
    matched, partial, missing, coverage = explain_skills(
        ["data analysis"], ["data science"]
    )
    assert "data science" in partial


def test_recommendation_reason_reports_partial_matches():
    reason = recommendation_reason([], ["data science"], ["python"], ["data science", "python"])
    assert "partial skill match" in reason
    assert "exact skill match" not in reason


def test_recommend_candidate_rejects_malformed_top_k(client):
    response = client.post("/recommend_candidate", json={
        "profile": {"skills": ["python"]},
        "top_k": "not-a-number",
    }, headers={"X-ML-Service-Token": "test-token"})
    assert response.status_code == 400


def test_recommend_candidate_rejects_malformed_min_match_score(client):
    response = client.post("/recommend_candidate", json={
        "profile": {"skills": ["python"]},
        "filters": {"min_match_score": "not-a-number"},
    }, headers={"X-ML-Service-Token": "test-token"})
    assert response.status_code == 400

def test_recommend_candidate_requires_service_token(client):
    response = client.post("/recommend_candidate", json={"profile": {"skills": ["python"]}})
    assert response.status_code == 401


def test_extract_cv_analysis_extracts_skills_and_education_from_sample_text():
    sample = """
    Alex Patel
    Skills: Python, SQL, Machine Learning, React
    Education: B.Tech in Computer Science
    Experience: Worked as a Python developer for 2 years.
    Projects: Built a React dashboard for analytics.
    Certifications: AWS Certified Cloud Practitioner
    """
    analysis = extract_cv_analysis(sample)
    assert analysis["status"] == "success"
    assert "python" in analysis["skills"]
    assert "sql" in analysis["skills"]
    assert any("Computer Science" in item for item in analysis["education"])


def test_score_recommendation_rows_uses_cv_analysis():
    df = _with_parsed_deadline(_make_df())
    profile = {
        "skills": ["python"],
        "sectorOfInterest": ["IT"],
        "education": [{"degree": "B.Tech", "fieldOfStudy": "Computer Science"}],
        "preferences": {"mode": "Remote", "locationPref": "Karnataka", "duration": "6"},
        "cvAnalysis": {
            "status": "success",
            "skills": ["python", "sql", "machine learning"],
            "education": ["B.Tech in Computer Science"],
            "experience": ["Worked with Python and SQL"],
            "projects": [],
            "certifications": [],
        },
    }
    results = score_recommendation_rows(df, profile, top_k=5)
    assert results
    assert results[0]["cv_similarity"] >= 0
