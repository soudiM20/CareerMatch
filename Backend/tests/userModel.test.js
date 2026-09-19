import { test } from "node:test";
import assert from "node:assert/strict";
import User from "../models/User.js";

test("a personal-details save is valid before later onboarding stages", () => {
  // The UI persists personal/contact data before education, preferences, and
  // the CV. This must validate as a legitimate intermediate profile state.
  const user = new User({
    email: "candidate@example.test",
    password: "hashed-password",
    candidateProfile: {
      firstName: "Asha",
      lastName: "Das",
      dateOfBirth: new Date("2000-01-01"),
      gender: "Female",
      phone: "+919876543210",
      address: "1 Example Road",
      city: "Kolkata",
      state: "West Bengal",
      country: "India",
      pincode: "700001",
    },
  });

  assert.equal(user.validateSync(), undefined);
});
