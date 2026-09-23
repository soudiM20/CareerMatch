import test from "node:test";
import assert from "node:assert/strict";
import { canonicalSkill, matchesRequiredSkills } from "../utils/skills.js";

test("public skill matching does not match Java to JavaScript", () => {
  assert.equal(matchesRequiredSkills(["JavaScript"], "Java"), false);
});

test("public skill matching accepts exact canonical and alias matches", () => {
  assert.equal(matchesRequiredSkills(["Python", "React"], "py"), true);
  assert.equal(matchesRequiredSkills(["JavaScript"], "js"), true);
  assert.equal(canonicalSkill(" JavaScript "), "javascript");
});

test("public skill matching handles empty and no-match input", () => {
  assert.equal(matchesRequiredSkills(["Python"], ""), false);
  assert.equal(matchesRequiredSkills(["Python"], "Java"), false);
  assert.equal(matchesRequiredSkills([], "Python"), false);
});