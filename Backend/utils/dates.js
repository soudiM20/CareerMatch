// Fix (deadline-semantics audit): Application_Deadline is a calendar date
// (parsed at import time as local midnight — see scripts/importInternships.js).
// The intended semantics (documented in README/CHANGES): an internship
// remains active through the *entire* deadline day and expires starting the
// next day. Comparing against `new Date()` (the exact current instant)
// instead of the start of today made internships disappear from listings
// the moment the clock passed midnight on their deadline day — hours before
// the day was actually over, and inconsistent with ML/app.py's
// `pd.Timestamp.now().normalize()`, which already compares day-to-day.
// startOfToday() gives Node the same "compare whole days" semantics Flask
// already uses, so the two services can't disagree about whether a given
// internship is still open.
export const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
