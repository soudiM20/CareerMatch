# Regression tests for the Stage-1 fixes in app.py.
# Usage: pip install pytest && pytest ML/test_app.py
#
# These intentionally test the two behaviors called out in the audit:
#  1. apply_filters must NOT fall back to the full dataset when nothing matches.
#  2. explain_skills must NOT treat "java" as a partial match for "javascript".

import pandas as pd
import pytest

from app import apply_filters, explain_skills, app as flask_app


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


def test_recommend_candidate_rejects_malformed_top_k(client):
    response = client.post("/recommend_candidate", json={
        "profile": {"skills": ["python"]},
        "top_k": "not-a-number",
    })
    assert response.status_code == 400


def test_recommend_candidate_rejects_malformed_min_match_score(client):
    response = client.post("/recommend_candidate", json={
        "profile": {"skills": ["python"]},
        "filters": {"min_match_score": "not-a-number"},
    })
    assert response.status_code == 400
