# CareerMatch — Intelligent Internship Recommendation Platform

CareerMatch is an explainable internship recommendation application. It pairs a candidate's profile with internship requirements, ranks opportunities, and makes the result understandable through skill coverage, matching evidence, and focused skill gaps.

## What it does

- Secure account registration and JWT-protected candidate profiles
- Multi-step profile collection with education, skills, preferences, and PDF CV upload
- Explainable ML-assisted internship ranking
- Match percentage, coverage bar, exact/partial matches, missing skills, and recommendation reason on every match
- Filtering by role, location, work mode, required skills, and minimum score
- Dashboard with profile strength, recommendation history, recent average match, and recurring skill gaps

## Architecture

```text
React + Vite UI  →  Express REST API + MongoDB  →  Flask recommendation service
                         │                                │
                         └── User profiles/history         └── TF-IDF internship catalog
```

The React client uses the configurable `VITE_API_URL` base URL and sends an authenticated recommendation request to Express. Express reads only the logged-in user's profile, forwards a minimal profile and requested filters to Flask, obtains ranked recommendation metadata, resolves the corresponding internship documents in MongoDB, and records compact recommendation-history metadata on that same user.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, Tailwind CSS, Lucide |
| API | Node.js, Express, Mongoose, JWT, bcrypt, Multer |
| Data | MongoDB, internship CSV import script |
| Matching service | Python, Flask, pandas, scikit-learn |

## How matching works

This is content-based matching, not a black-box claim of hiring suitability.

1. Internship title, company, sector, area, required skills, eligibility, benefits, and description are vectorized with TF-IDF (unigrams and bigrams).
2. Candidate skills (given extra text weight), interests, and education form a query vector.
3. Cosine similarity provides text relevance.
4. Required skills are normalized; a small visible alias table handles genuine equivalents such as `JS → JavaScript`.
5. Each required skill becomes **matched**, **partially matched**, or **missing**. Skill coverage counts a partial match as half credit.
6. The final score combines 70% skill coverage, 20% TF-IDF relevance, and up to 10% preference fit. Results are sorted by score.

The Flask service builds its TF-IDF index from `ML/internship.csv` when it starts. `ML/train.py` is retained as an optional offline training/export utility and is not required for normal API startup.

Example response metadata:

```json
{
  "internship_id": "INT-1024",
  "match_score": 82,
  "skill_coverage": 80,
  "matched_skills": ["python", "react", "mongodb"],
  "partially_matched_skills": ["sql"],
  "missing_skills": ["docker"],
  "recommendation_reason": "Strong alignment with 3 of 5 core required skills."
}
```

## API overview

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Obtain JWT |
| GET | `/api/users/profile` | Read the current user's profile |
| PUT | `/api/users/profile/personal` | Update personal/contact data |
| PUT | `/api/users/profile/other` | Update education, skills, preferences, PDF CV |
| GET | `/api/internships` | Browse/filter the catalog |
| GET | `/api/internships/recommend` | Get explainable personalized recommendations |
| GET | `/api/internships/recommend/history` | Get the current user's recommendation history |

Recommendation query parameters: `role`, `location`, `workMode`, `skills` (comma-separated), and `minMatchScore`.

## Run locally

Prerequisites: Node.js 20+, Python 3.10+, and MongoDB. Keep credentials outside source control.

```bash
# API
cd Backend
npm install
# copy .env.example to .env and set your local values
node app.js
```

```bash
# ML service (in another terminal)
cd ML
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

```bash
# frontend (in another terminal)
cd Frontend_Recommendation/Recommendation
npm install
# copy .env.example to .env when using a non-default API URL
npm run dev
```

To seed internships, ensure MongoDB is configured and run `node scripts/importInternships.js` from `Backend` once. Do not re-import without first deciding how duplicate `Internship_ID` records should be handled.

## Security notes

- JWT is required for profile, recommendation, and history endpoints.
- The API uses the authenticated user identity; clients cannot supply a different user ID to read profile data.
- Passwords are bcrypt hashed.
- CV uploads are limited to PDF files up to 5 MB.
- `.env` and uploaded CVs are ignored by Git. Never commit a real `.env` file or uploaded CVs; use the provided `.env.example` files as templates.

## Limitations and next steps

- The supplied catalog has 500 CSV rows and some blank CSV header columns; normalize the source dataset before larger production imports.
- Matching measures profile-to-listing relevance, not candidate quality or hiring likelihood.
- Add automated API/component tests and rate limiting before deployment.
- Add admin authorization only when an actual employer/admin workflow is introduced.

## Resume-ready bullets

- Built an explainable internship recommendation platform using React, Express, MongoDB, Flask, and scikit-learn TF-IDF ranking.
- Designed a transparent scoring pipeline combining skill coverage, cosine similarity, and candidate preferences; surfaced matched and missing skills for every recommendation.
- Implemented JWT-protected profiles, PDF CV validation, responsive analytics dashboard, filters, and per-user recommendation history.
