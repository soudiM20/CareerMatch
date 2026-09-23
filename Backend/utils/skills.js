const SKILL_ALIASES = {
  javascript: new Set(["js", "javascript", "ecmascript"]),
  typescript: new Set(["ts", "typescript"]),
  python: new Set(["python", "py"]),
  postgresql: new Set(["postgres", "postgresql"]),
  mongodb: new Set(["mongo", "mongodb"]),
  "machine learning": new Set(["ml", "machine learning"]),
  react: new Set(["react", "reactjs", "react.js"]),
};

export const normalizeSkill = (value) => String(value)
  .toLowerCase()
  .replace(/[^a-z0-9+#.]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

export const canonicalSkill = (value) => {
  const normalized = normalizeSkill(value);
  return Object.entries(SKILL_ALIASES).find(([, aliases]) => aliases.has(normalized))?.[0] || normalized;
};

export const parseSkills = (value) => {
  const values = Array.isArray(value) ? value : String(value || "").split(/[;,|/]/);
  return values.map(canonicalSkill).filter(Boolean);
};

export const matchesRequiredSkills = (requiredSkills, requestedSkills) => {
  const required = new Set(parseSkills(requiredSkills));
  return parseSkills(requestedSkills).some((skill) => required.has(skill));
};