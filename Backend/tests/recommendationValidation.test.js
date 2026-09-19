// Run with: npm test  (== `node --test tests/`)
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateRecommendationRequest } from "../utils/recommendationValidation.js";

test("accepts an empty body (all filters optional)", () => {
  const { valid, errors } = validateRecommendationRequest({});
  assert.equal(valid, true);
  assert.deepEqual(errors, []);
});

test("accepts a well-formed filter set", () => {
  const { valid } = validateRecommendationRequest({
    role: "Backend Developer",
    location: "Kolkata",
    workMode: "Remote",
    skills: "C++,Python",
    minMatchScore: 60,
  });
  assert.equal(valid, true);
});

test("rejects a null body", () => {
  const { valid, errors } = validateRecommendationRequest(null);
  assert.equal(valid, false);
  assert.ok(errors.length > 0);
});

test("rejects an array body", () => {
  const { valid } = validateRecommendationRequest([]);
  assert.equal(valid, false);
});

test("rejects an object where role should be a string", () => {
  const { valid, errors } = validateRecommendationRequest({ role: { $ne: null } });
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("role")));
});

test("rejects an array where skills should be a delimited string", () => {
  const { valid, errors } = validateRecommendationRequest({ skills: ["C++", "Python"] });
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("skills")));
});

test("rejects an invalid workMode enum value", () => {
  const { valid, errors } = validateRecommendationRequest({ workMode: "Anywhere" });
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("workMode")));
});

test("accepts workMode case-insensitively", () => {
  const { valid } = validateRecommendationRequest({ workMode: "remote" });
  assert.equal(valid, true);
});

test("rejects a non-numeric minMatchScore", () => {
  const { valid, errors } = validateRecommendationRequest({ minMatchScore: "high" });
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("minMatchScore")));
});

test("rejects a NaN-producing minMatchScore", () => {
  const { valid } = validateRecommendationRequest({ minMatchScore: "abc" });
  assert.equal(valid, false);
});

test("rejects a negative minMatchScore", () => {
  const { valid } = validateRecommendationRequest({ minMatchScore: -5 });
  assert.equal(valid, false);
});

test("rejects an out-of-range minMatchScore", () => {
  const { valid } = validateRecommendationRequest({ minMatchScore: 150 });
  assert.equal(valid, false);
});

test("rejects an object minMatchScore", () => {
  const { valid } = validateRecommendationRequest({ minMatchScore: { $gt: 0 } });
  assert.equal(valid, false);
});

test("rejects an overly long role string", () => {
  const { valid } = validateRecommendationRequest({ role: "a".repeat(500) });
  assert.equal(valid, false);
});
