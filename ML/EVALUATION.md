# CareerMatch Recommender Evaluation

Generated from the current `ML/evaluate.py` and `ML/internship.csv` on 2026-09-22. Run `python evaluate.py` from `ML/` to reproduce the JSON output. The numbers are not fabricated or hand-tuned.

## Scope

This is a small offline heuristic evaluation, not production accuracy and not recruiter or hiring-outcome data. It uses six hand-built candidate profiles and the current active rows in the 500-row dataset. A row is labeled relevant when it has at least two canonicalized candidate-skill overlaps and the candidate's declared sector.

The evaluator calls the same production functions for skill canonicalization, profile text, active-deadline filtering, preference semantics, score rounding, and tie-breaking. Production ordering is descending rounded score, descending skill coverage, then ascending internship ID. Missing or invalid deadlines are excluded; a deadline equal to today remains active for the calendar day.

## Metrics

| Configuration | MRR | Precision@5 | Recall@5 | NDCG@5 | Precision@10 | Recall@10 | NDCG@10 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **70/20/10 (current)** | 0.469 | 0.167 | 0.210 | 0.268 | 0.150 | 0.474 | 0.352 |
| 50/30/20 | 0.403 | 0.267 | 0.405 | 0.342 | 0.150 | 0.488 | 0.349 |
| 60/25/15 | 0.487 | 0.233 | 0.349 | 0.350 | 0.150 | 0.474 | 0.376 |

The current production configuration remains 70/20/10. The alternatives are comparison-only and do not change production weights.

## Metric definitions

- **Precision@K:** fraction of the first K results labeled relevant.
- **Recall@K:** fraction of all labeled-relevant rows present in the first K results.
- **NDCG@K:** ranking-sensitive relevance score that rewards earlier relevant results.
- **MRR:** mean reciprocal rank of the first labeled-relevant result per candidate.

## Limitations

Six candidates are not statistically representative. The labels are a simple proxy based on skills and sector, not human judgments. The evaluation uses the current catalog rather than a held-out or time-based dataset, so it does not measure future generalization. TF-IDF is lexical similarity; the recommender is content-based and does not infer hiring probability.
