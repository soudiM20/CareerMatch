# Pre-deploy checklist

This build was audited in a sandbox with no network access. Everything
below marks what was actually verified there vs. what still needs to be
done on a machine with real network/npm access before this goes live.

## Verified in this pass (commands actually run, not assumed)

- Backend: `node --test` → 26/27 passing. The 1 non-passing test
  (`tests/userModel.test.js`) failed only because `mongoose` isn't
  installed in the audit sandbox (`npm install` needs network access) —
  the Mongoose schema change it targets was verified correct by direct
  code review.
- ML: 9/9 tests passing (`ML/test_app.py`, hand-executed since `pytest`
  wasn't installable offline).
- `ML/evaluate.py` re-run from scratch, produces real (not fabricated)
  Precision/Recall/NDCG@K and MRR numbers — see `ML/EVALUATION.md`.
- `Backend/dataset_intern.csv` and `ML/internship.csv` confirmed
  byte-identical (500/500 rows, 0 field diffs).
- No secrets or a real `.env` committed anywhere in this zip; `.env.example`
  files are complete and accurate for all three services.
- `package-lock.json` (Backend + Frontend) are structurally valid, real
  lockfiles with pinned versions; `xlsx` confirmed removed from both.

## NOT verified — do these yourself before pushing

- [ ] `cd Frontend_Recommendation/Recommendation && npm install && npm run lint && npm run build`
      — never run in any sandbox that's touched this project (no network
      access anywhere it's been audited). Fix anything that fails.
- [ ] `cd Backend && npm install && npm test` — re-confirm all 27 pass
      once `mongoose` is actually installed.
- [ ] `cd ML && pip install -r requirements.txt && pytest` — re-confirm
      the real pytest run matches the 9/9 manual result.

## Before making it live

- [ ] Set a real, random `JWT_SECRET` in the deployed `Backend/.env`.
      `app.js` now refuses to start on the placeholder value — this is
      intentional, not a bug, but you need the real secret ready.
- [ ] Set `MONGO_URI` to your production/staging MongoDB, not
      `localhost`.
- [ ] Set `FLASK_API_URL` to your deployed Flask service's real URL.
- [ ] Set `FRONTEND_URLS` (CORS allow-list) to your deployed frontend's
      real origin(s) — no trailing slashes.
- [ ] Set `VITE_API_URL` in the frontend build to your deployed backend's
      real URL.
- [ ] Ensure `FLASK_DEBUG` is unset or `0` in production — leaving it on
      enables the interactive Werkzeug debugger (arbitrary code execution
      if the service is reachable from outside localhost).
- [ ] Run the import script once against production Mongo so the catalog
      isn't empty on first load.

## Known, documented (not blocking) limitations

Content-based recommender only, no collaborative filtering; CV content
isn't parsed into ranking; in-memory rate limiter is single-process only;
JWT lives in `localStorage` (XSS trade-off, documented at the point it's
set in `AuthPage.jsx`); local disk CV storage (fine for one instance, not
for horizontal scaling). None of these are bugs — they're scope decisions
appropriate for a single-instance student project, and each is safe to
describe honestly in an interview rather than a reason to hold off
shipping.
