# CareerMatch

CareerMatch is a student/demo project that ranks catalog internships against a saved candidate profile. It does **not** submit internship applications, contact employers, send confirmation email, or predict hiring outcomes.

## Features

- JWT-protected profile creation and editing: personal/contact details, education, skills, preferences, and a PDF CV.
- Explainable TF-IDF ranking with matched, partial, and missing skills.
- Public active-internship catalog filtering by role, mode, and the same city/state/district location rules used by the recommender.
- Per-user recommendation records, filters, profile-completeness status, and aggregate skill-gap counts.

## Architecture

`React/Vite → Express/MongoDB → Flask/pandas/scikit-learn`

The browser sends `POST /api/internships/recommend` with optional filters. Express takes the authenticated user's stored profile, sends only ranking fields to Flask, resolves ranked IDs against MongoDB, and stores up to 30 returned recommendation records. A browser refresh of the same result set within five minutes is not stored again.

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

`location` accepts a district/city, state, or comma-separated city and state (for example `Mysuru, Karnataka`). Empty, `Any`, and `Any location` do not filter. `On-site`, `Remote`, and `Hybrid` are supported modes.

## Local setup

Requires Node 20.19+ (or 22.12+), Python 3.12+, and MongoDB.

```bash
cd Backend
npm install
# Copy .env.example to .env, set MONGO_URI and a long random JWT_SECRET.
node scripts/importInternships.js
node app.js
```

```bash
cd ML
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

```bash
cd Frontend_Recommendation/Recommendation
npm install
# Optionally set VITE_API_URL in .env
npm run dev
```

The importer uses upserts by `Internship_ID`, so rerunning it refreshes existing records rather than creating duplicates. Run the frontend and both services together.

## Checks

```bash
cd Backend && npm test
cd Frontend_Recommendation/Recommendation && npm run lint && npm run build
cd ML && python -m pytest test_app.py && python evaluate.py
```

## Security and deployment notes

- Passwords use bcrypt; passwords are limited to 8–72 characters. Login/register endpoints have an in-memory per-IP rate limit.
- JWTs expire after seven days. The frontend stores the bearer token in `localStorage`; this is convenient for this demo but remains exposed to a same-origin XSS compromise. A production deployment should use short-lived, httpOnly, Secure, SameSite cookies with CSRF protection (or an equivalent token-refresh design).
- CORS is allowlisted through `FRONTEND_URLS`; do not use `*` with credentials. `JWT_SECRET`, MongoDB credentials, and deployment URLs must be environment secrets.
- CV files are size-limited to 5 MB, require a PDF MIME type plus `%PDF-` signature, receive UUID filenames, and are excluded from API responses. This is basic validation, not malware scanning.
- Local CV storage and the rate limiter are single-instance only. Multi-instance deployments need object storage and a shared limiter such as Redis. Use a production Node process manager and a WSGI server (for example Gunicorn) for Flask; do not expose Flask debug mode.
- Dependency ranges are lockfile-resolved for reproducible installs; review/update the lockfiles with `npm audit` in the target deployment environment.

## Dataset and evaluation

The shipped CSV has 500 rows, 17 sectors, and 12 distinct required-skill values. `ML/EVALUATION.md` documents a heuristic offline evaluation; it is not real applicant or recruiter outcome data.
