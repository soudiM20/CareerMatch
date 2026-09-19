// Fix (Node input-validation audit): POST /api/internships/recommend forwarded
// req.body straight into filters and on to Flask with no shape checking at
// all. An object where a string was expected, an array where a scalar was
// expected, or a non-numeric minMatchScore would previously reach Flask
// unchecked (Flask has its own defenses for top_k/min_match_score, but
// role/location/workMode/skills were never validated by either service).
// This validates the actual fields this endpoint accepts and returns a
// plain list of problems, so the controller can reject malformed input with
// a clear 400 before doing any work.

const WORK_MODES = ["remote", "on-site", "hybrid"];
const MAX_STRING_LENGTH = 200;

const isPlainScalarString = (value) => typeof value === "string";

const checkOptionalString = (value, field, errors, { maxLength = MAX_STRING_LENGTH } = {}) => {
  if (value === undefined || value === null || value === "") return;
  if (!isPlainScalarString(value)) {
    errors.push(`${field} must be a string.`);
    return;
  }
  if (value.length > maxLength) {
    errors.push(`${field} must be ${maxLength} characters or fewer.`);
  }
};

export const validateRecommendationRequest = (body) => {
  const errors = [];

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, errors: ["Request body must be a JSON object."] };
  }

  checkOptionalString(body.role, "role", errors);
  checkOptionalString(body.location, "location", errors);
  // skills currently travels as a single delimited string (see
  // ML/app.py:parse_skills, which splits on ;,|/) — not an array — so an
  // array or object here is a shape error, not a valid alternate format.
  checkOptionalString(body.skills, "skills", errors, { maxLength: 500 });

  if (body.workMode !== undefined && body.workMode !== null && body.workMode !== "") {
    if (!isPlainScalarString(body.workMode)) {
      errors.push("workMode must be a string.");
    } else if (!WORK_MODES.includes(body.workMode.trim().toLowerCase())) {
      errors.push(`workMode must be one of: Remote, On-site, Hybrid.`);
    }
  }

  if (body.minMatchScore !== undefined && body.minMatchScore !== null && body.minMatchScore !== "") {
    const score = Number(body.minMatchScore);
    if (
      typeof body.minMatchScore === "object" ||
      Array.isArray(body.minMatchScore) ||
      Number.isNaN(score) ||
      score < 0 ||
      score > 100
    ) {
      errors.push("minMatchScore must be a number between 0 and 100.");
    }
  }

  return { valid: errors.length === 0, errors };
};
