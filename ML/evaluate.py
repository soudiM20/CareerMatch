# Usage: python evaluate.py
#
# Reproducible offline evaluation of the CareerMatch recommender against a
# small hand-labeled candidate set drawn from the real internship.csv. See
# EVALUATION.md for the full write-up (dataset, method, results, and the
# explicit limitations of a 6-candidate evaluation set).
#
# This script does NOT modify app.py's live scoring. It re-implements the
# same scoring formula (skill coverage / TF-IDF relevance / preference fit)
# with the weights as a parameter, purely to compare configurations offline.

import math
import json

from app import (df, vectorizer, tfidf_matrix, apply_filters, explain_skills,
                 candidate_text, parse_skills, matches_location, normalize_mode,
                 duration_matches)

# ---------------------------------------------------------------------------
# Step 1: labeled evaluation data
#
# Ground truth here is a documented heuristic, not real recruiter judgments
# (this is a solo student project with no hiring data to draw on): an
# internship counts as "relevant" to a candidate if (a) it requires at least
# 2 of the candidate's stated skills, AND (b) it is in the candidate's
# declared sector of interest. This mirrors what a genuinely well-matched
# internship should look like given the fields the recommender actually
# uses, without hand-picking IDs to flatter any particular configuration.
# ---------------------------------------------------------------------------

CANDIDATES = [
    {
        "candidate_id": "C001",
        "skills": ["Python", "Data Analysis", "Excel", "Research Skills"],
        "sectorOfInterest": ["IT & Software Development"],
        "education": [{"degree": "B.Tech", "fieldOfStudy": "Computer Science"}],
        "preferences": {"mode": "Remote", "locationPref": ""},
    },
    {
        "candidate_id": "C002",
        "skills": ["Communication", "Sales Skills", "Writing"],
        "sectorOfInterest": ["Retail & Consumer Durables"],
        "education": [{"degree": "BBA", "fieldOfStudy": "Marketing"}],
        "preferences": {"mode": "On-site", "locationPref": ""},
    },
    {
        "candidate_id": "C003",
        "skills": ["Chemistry", "Research Skills"],
        "sectorOfInterest": ["Pharmaceutical"],
        "education": [{"degree": "B.Sc", "fieldOfStudy": "Chemistry"}],
        "preferences": {"mode": "", "locationPref": ""},
    },
    {
        "candidate_id": "C004",
        "skills": ["Electrical Maintenance", "Networking"],
        "sectorOfInterest": ["Telecom"],
        "education": [{"degree": "B.Tech", "fieldOfStudy": "Electrical Engineering"}],
        "preferences": {"mode": "", "locationPref": ""},
    },
    {
        "candidate_id": "C005",
        "skills": ["Agriculture Basics", "Communication"],
        "sectorOfInterest": ["FMCG"],
        "education": [{"degree": "B.Sc", "fieldOfStudy": "Agriculture"}],
        "preferences": {"mode": "", "locationPref": ""},
    },
    {
        "candidate_id": "C006",
        "skills": ["Editing", "Writing", "Communication"],
        "sectorOfInterest": ["Media, Entertainment & Education"],
        "education": [{"degree": "BA", "fieldOfStudy": "Journalism"}],
        "preferences": {"mode": "", "locationPref": ""},
    },
]

K_VALUES = [5, 10]

WEIGHT_CONFIGS = {
    "70/20/10 (current)": (0.70, 0.20, 10),
    "50/30/20": (0.50, 0.30, 20),
    "60/25/15": (0.60, 0.25, 15),
}


def build_labels(candidate):
    """Ground-truth relevant internship IDs for one candidate, restricted to
    the currently-active dataset (an already-expired internship can never be
    recommended, so it would be an unfair/impossible label to include)."""
    active = apply_filters(df, candidate, {})
    candidate_skill_set = {s.strip().lower() for s in candidate["skills"]}
    relevant = []
    for _, row in active.iterrows():
        required = {s.strip().lower() for s in parse_skills(row.get("Required_Skills", ""))}
        overlap = len(candidate_skill_set & required)
        same_sector = row.get("Sector") in candidate["sectorOfInterest"]
        if overlap >= 2 and same_sector:
            relevant.append(str(row["Internship_ID"]))
    return active, relevant


def score_candidate(candidate, active, skill_weight, relevance_weight, preference_weight_pct):
    """Re-implements app.py's recommend_candidate scoring with configurable
    weights, returning internship IDs ranked highest score first."""
    similarities = vectorizer.transform([candidate_text(candidate)])
    sims = (tfidf_matrix[active.index] @ similarities.T).toarray().flatten()
    # cosine_similarity(A, B) on TF-IDF (L2-normalized) vectors reduces to a
    # plain dot product, avoiding importing sklearn's cosine_similarity twice
    preferences = candidate.get("preferences", {})
    scored = []
    for position, (_, row) in enumerate(active.iterrows()):
        required = parse_skills(row.get("Required_Skills", ""))
        _, _, _, coverage = explain_skills(candidate["skills"], required)
        relevance = round(float(sims[position]) * 100)
        # Match app.py's production preference semantics exactly. The
        # configurable percentage simply scales the same 10-point maximum.
        raw_preference_fit = (
            (3 if preferences.get("mode") and normalize_mode(row.get("Mode", "")) == normalize_mode(preferences["mode"]) else 0) +
            (3 if preferences.get("locationPref") and matches_location(row, preferences["locationPref"]) else 0) +
            (4 if duration_matches(row.get("Duration_Months"), preferences.get("duration")) else 0)
        )
        preference_component = (preference_weight_pct / 10) * raw_preference_fit
        score = skill_weight * coverage + relevance_weight * relevance + preference_component
        scored.append((str(row["Internship_ID"]), score))
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return [internship_id for internship_id, _ in scored]


def precision_at_k(ranked, relevant, k):
    top_k = ranked[:k]
    if not top_k:
        return 0.0
    hits = sum(1 for item in top_k if item in relevant)
    return hits / len(top_k)


def recall_at_k(ranked, relevant, k):
    if not relevant:
        return None  # undefined for a candidate with zero labeled-relevant items
    hits = sum(1 for item in ranked[:k] if item in relevant)
    return hits / len(relevant)


def ndcg_at_k(ranked, relevant, k):
    dcg = 0.0
    for i, item in enumerate(ranked[:k]):
        if item in relevant:
            dcg += 1 / math.log2(i + 2)  # i is 0-indexed, rank is i+1
    ideal_hits = min(len(relevant), k)
    idcg = sum(1 / math.log2(i + 2) for i in range(ideal_hits))
    if idcg == 0:
        return None
    return dcg / idcg


def reciprocal_rank(ranked, relevant):
    for i, item in enumerate(ranked):
        if item in relevant:
            return 1 / (i + 1)
    return 0.0


def run_evaluation():
    all_results = {}
    for config_name, (skill_w, rel_w, pref_w_pct) in WEIGHT_CONFIGS.items():
        per_k_metrics = {k: {"precision": [], "recall": [], "ndcg": []} for k in K_VALUES}
        mrr_scores = []
        per_candidate_detail = []

        for candidate in CANDIDATES:
            active, relevant = build_labels(candidate)
            ranked = score_candidate(candidate, active, skill_w, rel_w, pref_w_pct)
            mrr_scores.append(reciprocal_rank(ranked, relevant))
            detail = {"candidate_id": candidate["candidate_id"], "num_relevant_labels": len(relevant)}
            for k in K_VALUES:
                p = precision_at_k(ranked, relevant, k)
                r = recall_at_k(ranked, relevant, k)
                n = ndcg_at_k(ranked, relevant, k)
                per_k_metrics[k]["precision"].append(p)
                if r is not None:
                    per_k_metrics[k]["recall"].append(r)
                if n is not None:
                    per_k_metrics[k]["ndcg"].append(n)
                detail[f"precision@{k}"] = round(p, 3)
                detail[f"recall@{k}"] = round(r, 3) if r is not None else None
                detail[f"ndcg@{k}"] = round(n, 3) if n is not None else None
            per_candidate_detail.append(detail)

        summary = {"MRR": round(sum(mrr_scores) / len(mrr_scores), 3)}
        for k in K_VALUES:
            summary[f"Precision@{k}"] = round(sum(per_k_metrics[k]["precision"]) / len(per_k_metrics[k]["precision"]), 3)
            recalls = per_k_metrics[k]["recall"]
            summary[f"Recall@{k}"] = round(sum(recalls) / len(recalls), 3) if recalls else None
            ndcgs = per_k_metrics[k]["ndcg"]
            summary[f"NDCG@{k}"] = round(sum(ndcgs) / len(ndcgs), 3) if ndcgs else None

        all_results[config_name] = {"summary": summary, "per_candidate": per_candidate_detail}

    return all_results


if __name__ == "__main__":
    results = run_evaluation()
    print(json.dumps(results, indent=2))
