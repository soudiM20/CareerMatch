import { test } from "node:test";
import assert from "node:assert/strict";
import User from "../models/User.js";
import { hasValidEducation, isValidCalendarDate } from "../controllers/userController.js";

test("strict calendar-date validation rejects impossible dates", () => {
  assert.equal(isValidCalendarDate("2000-02-29"), true);
  assert.equal(isValidCalendarDate("2025-02-29"), false);
  assert.equal(isValidCalendarDate("2024-02-31"), false);
  assert.equal(isValidCalendarDate("2024-2-03"), false);
});

test("education dates use strict calendar dates and chronological order", () => {
  const validEntry = {
    degree: "B.Tech",
    institution: "Example University",
    fieldOfStudy: "Computer Science",
    startDate: "2024-02-01",
    endDate: "2025-01-01",
    grade: "A",
  };
  assert.equal(hasValidEducation([{ ...validEntry, startDate: "2024-02-31" }]), false);
  assert.equal(hasValidEducation([{ ...validEntry, endDate: "2023-01-01" }]), false);
  assert.equal(hasValidEducation([validEntry]), true);
});

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
