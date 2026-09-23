# Pre-deploy checklist

This checklist records the implementation and the commands required before deployment. A checked item means it was run in the current workspace; unchecked items still require deployment-environment verification.

## Verified in this audit

- [x] Backend regression suite: `npm test` (30 passing).
- [x] ML regression suite: `python -m pytest` (12 passing).
- [x] Python syntax compilation: `python -m py_compile app.py evaluate.py test_app.py train.py test.py`.
- [x] Offline evaluation regenerated from current code and dataset; see `ML/EVALUATION.md`.
- [x] Frontend lint and clean-install build: run from `Frontend_Recommendation/Recommendation` after `npm ci`.
- [x] CV uploads remain MIME/signature/size validated and locally stored under generated UUID filenames; PDF contents are not parsed.
- [x] Public internship DTOs omit `Requirement_Contact` and unnecessary internal/long fields.
- [x] No real `.env` is retained in the project; only `.env.example` templates remain.

## Before making it live

- [ ] Set a new, random `JWT_SECRET` in the deployed `Backend/.env`; the previously exposed value must be invalidated.
- [ ] Set `MONGO_URI` to your production/staging MongoDB, not
      `localhost`.
- [ ] Set `FLASK_API_URL` to your deployed Flask service's real URL.
- [ ] Set a new, matching random `FLASK_SERVICE_TOKEN` in Backend and ML; the previously exposed value must be invalidated and the token must never reach the frontend.
- [ ] Set `FRONTEND_URLS` (CORS allow-list) to your deployed frontend's
      real origin(s) — no trailing slashes.
- [ ] Set `VITE_API_URL` in the frontend build to your deployed backend's
      real URL.
- [ ] Ensure `FLASK_DEBUG` is unset or `0` in production — leaving it on
      enables the interactive Werkzeug debugger (arbitrary code execution
      if the service is reachable from outside localhost).
- [ ] Run the import script once against production Mongo so the catalog
      isn't empty on first load.
- [ ] Run Flask with Gunicorn (`gunicorn --bind 0.0.0.0:$PORT app:app`) in production, not the development server.

## Known limitations

The recommender is content-based only, with lexical TF-IDF and explicit skill overlap. The evaluation is small, heuristic, and offline. CV content is not parsed into features. CV storage is local-disk and the rate limiter is process-local, so horizontal deployments need object storage and a shared limiter. JWTs are stored in `localStorage`, which remains an XSS trade-off for this demo. Flask should run behind a production WSGI server with private networking.
