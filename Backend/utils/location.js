import { literalRegex } from "./searchRegex.js";

const normalize = (value) => String(value || "")
  .toLowerCase()
  .replace(/[^a-z0-9+#.]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

export const isAnyLocation = (value) => ["", "any", "any location", "any-location"].includes(normalize(value));

// Keep public catalog filtering aligned with ML/app.py: every comma-separated
// city/state term must occur in the listing's district + state fields.
export const locationQuery = (value) => {
  if (isAnyLocation(value)) return null;
  const terms = String(value).split(",").map(normalize).filter(Boolean);
  if (!terms.length) return null;
  return {
    $and: terms.map((term) => ({
      $or: [
        { Internship_District: literalRegex(term) },
        { Internship_State: literalRegex(term) },
      ],
    })),
  };
};
