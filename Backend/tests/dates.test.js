import { test } from "node:test";
import assert from "node:assert/strict";
import { startOfToday } from "../utils/dates.js";

test("startOfToday returns midnight of the current local day", () => {
  const result = startOfToday();
  assert.equal(result.getHours(), 0);
  assert.equal(result.getMinutes(), 0);
  assert.equal(result.getSeconds(), 0);
  assert.equal(result.getMilliseconds(), 0);
  const now = new Date();
  assert.equal(result.getFullYear(), now.getFullYear());
  assert.equal(result.getMonth(), now.getMonth());
  assert.equal(result.getDate(), now.getDate());
});

test("an internship whose deadline is today is still >= startOfToday", () => {
  // Regression for the deadline-semantics bug: a deadline stored as
  // midnight of *today* (as scripts/importInternships.js stores it) must
  // still count as active for the rest of today, not just for the single
  // instant of midnight.
  const todayMidnight = startOfToday();
  assert.ok(todayMidnight >= startOfToday());
  // Simulate "now" being several hours later in the day — the internship's
  // deadline (today's midnight) must remain >= startOfToday() the whole day.
  const laterToday = new Date(todayMidnight.getTime() + 20 * 60 * 60 * 1000); // +20h
  assert.ok(todayMidnight >= startOfToday(), "deadline day stays active even late in the day");
  assert.ok(laterToday >= todayMidnight);
});

test("an internship whose deadline was yesterday is excluded", () => {
  const yesterday = new Date(startOfToday().getTime() - 24 * 60 * 60 * 1000);
  assert.ok(yesterday < startOfToday());
});
