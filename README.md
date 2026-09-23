# CareerMatch

CareerMatch is a student/demo project that ranks active catalog internships against a saved candidate profile. It does **not** submit applications, contact employers, send email, or predict hiring outcomes.

## Live Demo

- **Frontend:** https://careermatch-frontend-inhq.onrender.com
- **Backend API:** https://careermatch-backend-fwgh.onrender.com
- **ML Service:** https://careermatch-ml.onrender.com
  
## Features

- JWT-protected profile creation and editing: personal/contact details, education, skills, preferences, and a PDF CV.
- Secure PDF upload validation and CV processing with OCR fallback when a PDF is image-based or text extraction is empty.
- Explainable hybrid ranking that combines structured profile signals with CV-derived skill and semantic similarity.
- Public active-internship catalog filtering by role, mode, and the same city/state/district location rules used by the recommender.
- Per-user recommendation records, filters, profile-completeness status, and aggregate skill-gap counts.

## Architecture

`React/Vite → Express/MongoDB → private Flask/pandas/scikit-learn service`

The browser uploads a PDF CV to Express. The backend validates the file, stores it locally under a generated UUID name, extracts a minimal CV analysis in the Flask service, and persists only the derived skills/education/experience/project/certification summary in MongoDB. Recommendation requests send the candidate's structured profile plus the stored CV analysis to Flask, which blends TF-IDF relevance, skill overlap, CV-derived signals, and preference fit before returning ranked internships. A browser refresh of the same ordered result set within five minutes is not stored again.

## API

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Return JWT |
| GET | `/api/users/profile` | Yes | Read profile |
| PUT | `/api/users/profile/personal` | Yes | Save personal/contact fields |
| PUT | `/api/users/profile/other` | Yes | Save recommendation fields and optional replacement PDF CV (`multipart/form-data`) |
| GET | `/api/internships` | No | List open catalog entries; optional `role`, `location`, `workMode`, `skills` |
| GET | `/api/internships/:id` | No | Read an open catalog entry |
| POST | `/api/internships/recommend` | Yes | Generate recommendations; optional JSON `role`, `location`, `workMode`, `skills`, `minMatchScore` |
| GET | `/api/internships/recommend/history` | Yes | Read recommendation records |
| GET | `/api/internships/search?query=...` | No | Search open catalog entries |
| GET | `/api/health`, `/api/ready` | No | Liveness/readiness |

`location` accepts a district/city, state, or comma-separated city and state (for example `Mysuru, Karnataka`). Empty, `Any`, and `Any location` do not filter. `On-site`, `Remote`, and `Hybrid` are supported modes. Public catalog responses omit internal database metadata, requirement contact data, and long eligibility/workflow fields not needed by the UI.

## Local setup

Requires Node 20.19+ (or 22.12+), Python 3.12+, and MongoDB.

```bash
cd Backend
npm ci
# Copy .env.example to .env, set MONGO_URI and a long random JWT_SECRET.
node scripts/importInternships.js
node app.js
```

```bash
cd ML
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Local development only:
python app.py
# Production WSGI server:
# gunicorn --bind 0.0.0.0:$PORT app:app
```

```bash
cd Frontend_Recommendation/Recommendation
npm ci
# Optionally set VITE_API_URL in .env
npm run dev
```

The importer uses upserts by `Internship_ID`, so rerunning it refreshes existing records rather than creating duplicates. Run the frontend and both services together.

## Checks

```bash
cd Backend && npm test
cd Frontend_Recommendation/Recommendation && npm run lint && npm run build
cd ML && python -m pytest && python -m py_compile app.py evaluate.py test_app.py train.py test.py
cd ML && python evaluate.py
```

## Security and deployment notes

- Passwords use bcrypt; passwords are limited to 8–72 characters. Login/register endpoints have an in-memory per-IP rate limit.
- JWTs expire after seven days. The frontend stores the bearer token in `localStorage`; this is convenient for this demo but remains exposed to a same-origin XSS compromise. A production deployment should use short-lived, httpOnly, Secure, SameSite cookies with CSRF protection (or an equivalent token-refresh design).
- CORS is allowlisted through `FRONTEND_URLS`; do not use `*` with credentials. `JWT_SECRET`, MongoDB credentials, and deployment URLs must be environment secrets.
- The backend and Flask service must share a long random `FLASK_SERVICE_TOKEN`; keep Flask on private service networking and never expose this token to the browser.
- CV files are size-limited to 5 MB, require a PDF MIME type plus `%PDF-` signature, receive UUID filenames, and are excluded from API responses. This is basic validation, not malware scanning.
- Local CV storage and the rate limiter are single-instance only. Multi-instance deployments need object storage and a shared limiter such as Redis. Use a production Node process manager and a WSGI server (for example Gunicorn) for Flask; do not expose Flask debug mode.
- Dependency ranges are lockfile-resolved for reproducible installs; review/update the lockfiles with `npm audit` in the target deployment environment.
- The recommender is content-based: TF-IDF is lexical text similarity plus explicit skill overlap, not a hiring-probability model. CV contents are validated and stored as PDFs but are not parsed into recommendation features; saved languages and experience are not currently scoring inputs.

## Dataset and evaluation

The shipped CSV has 500 rows, 17 sectors, and 12 distinct required-skill values. `ML/EVALUATION.md` documents a small heuristic/offline evaluation; it is not real applicant or recruiter outcome data and must not be presented as production accuracy.
