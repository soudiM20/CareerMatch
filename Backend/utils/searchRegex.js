// Escapes regex metacharacters so user-supplied search/filter text is always
// treated as a literal substring match, never as a regex pattern.
// (Fixes: unescaped user input passed straight into `new RegExp(...)`,
// which allowed regex injection / catastrophic-backtracking patterns.)
// Pulled into its own module so it can be unit-tested without spinning up
// Express or MongoDB (see tests/searchRegex.test.js).
export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const literalRegex = (value, flags = "i") => new RegExp(escapeRegex(value), flags);
