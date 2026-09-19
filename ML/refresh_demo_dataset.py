"""Refresh CareerMatch's sample internship dataset so it demos cleanly.

Why this exists (audit finding, Sept 2026 pass): both `ML/internship.csv`
and `Backend/dataset_intern.csv` ship with `Application_Deadline` values
from Oct-Nov 2025. That is demo-data staleness, not a filtering bug — the
expired-internship filter (Backend/controllers/internshipController.js,
ML/app.py) is working exactly as intended. But it means every listing,
search, and recommendation request legitimately returns zero results until
the dataset is refreshed, which makes the app look broken in a live demo.

This script is the reproducible fix CHANGES_STAGE1/2/3 kept warning was
still needed:
  1. Shifts every Application_Deadline forward so deadlines are spread
     roughly `--days-ahead` days into the future from today, preserving
     each row's original relative ordering/spacing.
  2. Fixes Requirement_Contact: the source data stores real 10-digit phone
     numbers with a spurious leading minus sign (a spreadsheet-export
     artifact — confirmed not something the application code introduces).
     Strips the sign.
  3. Drops the four fully-empty "Unnamed: N" columns (CSV export artifacts
     with no data in any of the 500 rows) from both files.
  4. Writes both CSVs so Backend and ML stay byte-for-byte synchronized —
     same Internship_ID set, same values, no drift between the two copies.

Usage:
    python ML/refresh_demo_dataset.py
    python ML/refresh_demo_dataset.py --days-ahead 120   # spread further out

Re-run this any time the sample data goes stale again (e.g. every few
months of not touching the project) rather than hand-editing the CSVs.
"""
import argparse
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
ML_CSV = BASE_DIR / "internship.csv"
BACKEND_CSV = BASE_DIR.parent / "Backend" / "dataset_intern.csv"
UNNAMED_PREFIX = "Unnamed:"


def refresh(days_ahead: int) -> None:
    df = pd.read_csv(ML_CSV)

    # --- 1. Drop empty export-artifact columns -----------------------------
    junk_cols = [c for c in df.columns if c.startswith(UNNAMED_PREFIX) and df[c].isna().all()]
    if junk_cols:
        df = df.drop(columns=junk_cols)
        print(f"Dropped empty columns: {junk_cols}")

    # --- 2. Fix Requirement_Contact sign ------------------------------------
    contact_numeric = pd.to_numeric(df["Requirement_Contact"], errors="coerce")
    negative_count = int((contact_numeric < 0).sum())
    df["Requirement_Contact"] = contact_numeric.abs().astype("Int64").astype(str)
    print(f"Fixed {negative_count} negative Requirement_Contact values")

    # --- 3. Shift deadlines into the future, preserving relative spread ----
    parsed = pd.to_datetime(df["Application_Deadline"], format="%d-%m-%Y", errors="coerce")
    if parsed.isna().any():
        bad = int(parsed.isna().sum())
        raise SystemExit(f"Refusing to continue: {bad} Application_Deadline values didn't parse as DD-MM-YYYY")

    today = pd.Timestamp.now().normalize()
    oldest, newest = parsed.min(), parsed.max()
    span = (newest - oldest).days or 1
    target_start = today + pd.Timedelta(days=7)  # leave a short "already past" tail out of the demo
    scale = days_ahead / span
    shifted = target_start + (parsed - oldest) * scale
    df["Application_Deadline"] = shifted.dt.strftime("%d-%m-%Y")
    print(f"Deadlines now span {shifted.min().date()} to {shifted.max().date()}")

    # --- 4. Write both copies, byte-for-byte identical ----------------------
    df.to_csv(ML_CSV, index=False)
    df.to_csv(BACKEND_CSV, index=False)
    print(f"Wrote {len(df)} rows to {ML_CSV} and {BACKEND_CSV}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--days-ahead", type=int, default=90, help="Spread deadlines across this many days from ~1 week out (default: 90)")
    args = parser.parse_args()
    refresh(args.days_ahead)
