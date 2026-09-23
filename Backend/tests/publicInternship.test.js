import test from "node:test";
import assert from "node:assert/strict";
import { publicInternship } from "../utils/publicInternship.js";

test("public internship DTO excludes internal metadata", () => {
  assert.deepEqual(
    publicInternship({
      _id: "internal-id",
      __v: 0,
      createdAt: "created",
      updatedAt: "updated",
      Internship_ID: "CM-1",
      Requirement_Contact: "contact@example.com",
    }),
    {
      Internship_ID: "CM-1",
    },
  );
});
