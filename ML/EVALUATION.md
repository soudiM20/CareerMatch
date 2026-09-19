# CareerMatch Recommender — Offline Evaluation

Run with: `python evaluate.py` (from the `ML/` directory, with `requirements.txt`
installed). Produces the JSON results this document is built from — nothing
here is invented or hand-tuned after the fact.

## 1. Dataset

The real `internship.csv` shipped with the project (500 internships, 12
distinct required-skill values, 17 sectors). No synthetic internships were
added.

6 candidate profiles were hand-built from that same skill/sector vocabulary
(not invented terms), one per major sector, e.g.:

| Candidate | Skills | Sector |
|---|---|---|
| C001 | Python, Data Analysis, Excel, Research Skills | IT & Software Development |
| C002 | Communication, Sales Skills, Writing | Retail & Consumer Durables |
| C003 | Chemistry, Research Skills | Pharmaceutical |
| C004 | Electrical Maintenance, Networking | Telecom |
| C005 | Agriculture Basics, Communication | FMCG |
| C006 | Editing, Writing, Communication | Media, Entertainment & Education |

**Ground truth is a documented heuristic, not real recruiter judgments** —
this is a solo student project with no hiring-outcome data to label against.
An internship counts as relevant to a candidate if it (a) requires at least
2 of the candidate's stated skills, and (b) is in the candidate's declared
sector. This is a reasonable proxy given what the recommender actually
reads, but it is a proxy, and a different labeling rule would shift the
numbers below.

## 2. Evaluation setup

For each candidate, `evaluate.py` reuses the exact same functions `app.py`
uses at request time (`apply_filters`, `explain_skills`, `candidate_text`,
the same TF-IDF matrix) to rank all currently-active internships, then
compares the ranking against that candidate's labeled-relevant set.

## 3. Metrics (K = 5, K = 10)

- **Precision@K** — of the top K recommended internships, what fraction are
  labeled relevant. Measures how much of what the user sees is useful.
- **Recall@K** — of all labeled-relevant internships, what fraction appear
  in the top K. Measures how much relevant material is being surfaced.
- **NDCG@K** — like Precision@K, but rewards relevant results appearing
  *earlier* in the ranking, not just present anywhere in the top K.
- **MRR** (Mean Reciprocal Rank) — the average of 1/rank of the first
  relevant result per candidate; a single-number measure of "how far down
  do I have to scroll before finding something relevant".

## 4. Scoring configurations tested

The current production weights are 70% skill coverage / 20% TF-IDF semantic
relevance / 10% preference fit. Two alternatives were tested against the
same candidates and labels:

| Config | Skill coverage | Semantic relevance | Preference fit |
|---|---|---|---|
| 70/20/10 (current) | 70% | 20% | 10% |
| 60/25/15 | 60% | 25% | 15% |
| 50/30/20 | 50% | 30% | 20% |

## 5. Results

| Config | MRR | P@5 | R@5 | NDCG@5 | P@10 | R@10 | NDCG@10 |
|---|---|---|---|---|---|---|---|
| **70/20/10 (current)** | 0.487 | 0.200 | 0.294 | 0.316 | 0.150 | 0.474 | 0.365 |
| 60/25/15 | 0.489 | 0.233 | 0.349 | 0.350 | 0.167 | 0.530 | 0.404 |
| 50/30/20 | 0.486 | 0.267 | 0.405 | 0.380 | 0.150 | 0.488 | 0.387 |

(Full per-candidate breakdown is in `evaluate.py`'s output — run it to see
each of the 6 candidates individually.)

On this evaluation set, the alternatives improve the top-five metrics but
not every metric. Skill coverage is coarse (with 2–4 required skills per
internship, it often lands on a small set of values), while TF-IDF relevance
has finer granularity; this is a directional observation, not outcome data.

## 6. Limitations — read before changing production weights

- **6 candidates is not enough evidence to change a production default.**
  This is a directional signal, not a statistically powered result. A
  single candidate (C006) with 7 labeled-relevant internships materially
  moves every summary metric.
- **The label rule itself is a design choice.** "Overlap ≥ 2 AND same
  sector" was picked because it is simple, reproducible, and grounded in
  the actual fields the recommender uses — but a real recruiter's notion of
  "relevant" would weigh many things this heuristic can't see (internship
  description quality, actual skill importance, seniority fit).
- **No held-out or time-based split** — this evaluates ranking quality on
  the current live dataset, not generalization to future postings.

## 7. Selected configuration

**Recommendation: keep 70/20/10 for now**, despite the alternatives scoring
better here. The evidence base (6 hand-built candidates) is too small to
justify changing a production scoring formula that real users are currently
being ranked by. This evaluation is a reusable framework — the honest next
step is to grow the labeled set (more candidates, ideally with input from
someone other than the person who wrote the recommender) before treating
50/30/20 or 60/25/15 as anything more than "worth watching."
