import { test } from "node:test";
import assert from "node:assert/strict";
import { isAnyLocation, locationQuery } from "../utils/location.js";

test("any, empty, and null locations do not filter", () => {
  for (const value of [undefined, null, "", "Any location", "any-location"]) assert.equal(locationQuery(value), null);
  assert.equal(isAnyLocation("Any location"), true);
});

test("location filters require every city/state term in district or state", () => {
  const filter = locationQuery("Mysuru, Karnataka");
  assert.equal(filter.$and.length, 2);
  assert.ok(filter.$and[0].$or[0].Internship_District.test("Mysuru"));
  assert.ok(filter.$and[1].$or[1].Internship_State.test("Karnataka"));
});
