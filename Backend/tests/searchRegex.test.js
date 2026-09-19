// Run with: npm test  (== `node --test tests/`)
// Uses Node's built-in test runner (available in Node >=18), so no extra
// test framework dependency is required for this project's size.
import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeRegex, literalRegex } from "../utils/searchRegex.js";

test("escapeRegex neutralizes regex metacharacters", () => {
  const escaped = escapeRegex("C++ (Backend)");
  assert.equal(escaped, "C\\+\\+ \\(Backend\\)");
});

test("literalRegex matches the input as a literal substring", () => {
  const regex = literalRegex("C++");
  assert.ok(regex.test("Looking for a C++ developer"));
  assert.ok(!regex.test("Looking for a C developer"));
});

test("literalRegex does not let regex-injection patterns act as regex", () => {
  // A malicious/careless query containing regex syntax must be treated as
  // literal text, not interpreted — e.g. ".*" should not match everything.
  const regex = literalRegex(".*");
  assert.ok(regex.test("contains .* literally"));
  assert.ok(!regex.test("this would match anything if .* were live regex".replace(".*", "")));
});

test("literalRegex guards against catastrophic-backtracking-style input", () => {
  // Regex-injection-style input like "(a+)+$" must be treated as a literal
  // string to search for, not compiled as an actual (potentially expensive)
  // regex pattern.
  const regex = literalRegex("(a+)+$");
  assert.ok(regex.test("pattern: (a+)+$ here"));
  assert.ok(!regex.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!"));
});
