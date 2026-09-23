import User from "../models/User.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { analyzeCvFile } from "../services/cvAnalysisService.js";

// Storage note (Task 13 audit): CVs are stored on this server's local disk
// (`uploads/cv/`), keyed by a generated UUID filename with only the
// MongoDB-stored metadata (originalName, size, uploadedAt) pointing back to
// it. That's appropriate for the current single-instance deployment this
// project runs as — simple, no extra infra, and every request is served by
// the same process that wrote the file.
// It does NOT scale to more than one backend instance: a second Node
// process (behind a load balancer, or in a container that gets recreated)
// would not see files written by the first, since nothing here is shared.
// Production path if/when that's needed:
//   CV upload → object storage (S3-compatible bucket) → MongoDB stores only
//   the object key/reference, never the file itself.
// Not implemented here because there is no concrete multi-instance
// deployment requirement today — adding it now would be infra the project
// doesn't need yet.
const uploadDir = "uploads/cv";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Fix (CV upload security): the previous implementation validated only the
// client-supplied `mimetype` (trivially spoofable) and stored the file under
// a name that embedded the original, attacker-controlled filename. This now
// buffers the upload in memory, checks the real PDF file signature
// ("%PDF-") before it ever touches disk, and writes it under a fully
// synthetic UUID filename — the original filename is kept only as metadata,
// never used to build a path.
const storage = multer.memoryStorage();

const PDF_MAGIC_BYTES = Buffer.from("%PDF-");
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
export const isValidCalendarDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};
const isValidDate = (value) => isNonEmptyString(value) && isValidCalendarDate(value);
const hasNonEmptyStrings = (values) => Array.isArray(values) && values.length > 0 && values.every(isNonEmptyString);
export const hasValidEducation = (entries) => Array.isArray(entries) && entries.length > 0 && entries.every((entry) => {
  if (!entry || typeof entry !== "object") return false;
  const fields = ["degree", "institution", "fieldOfStudy", "startDate", "endDate", "grade"];
  if (!fields.every((field) => isNonEmptyString(entry[field]))) return false;
  if (!isValidCalendarDate(entry.startDate) || !isValidCalendarDate(entry.endDate)) return false;
  const start = new Date(`${entry.startDate}T00:00:00`);
  const end = new Date(`${entry.endDate}T00:00:00`);
  return start <= end;
});
const hasValidLanguages = (languages) => Array.isArray(languages) && languages.length > 0 && languages.every((language) =>
  language && typeof language === "object" && isNonEmptyString(language.name) && isNonEmptyString(language.proficiency)
);

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error("Only PDF CV uploads are accepted"));
  },
});

// Validates the real file signature and persists the buffer to disk under a
// UUID filename. Call this from a route handler after `upload.single("cv")`
// has populated `req.file.buffer`.
export const persistCvUpload = (req, res, next) => {
  if (!req.file) return next();
  const header = req.file.buffer.subarray(0, PDF_MAGIC_BYTES.length);
  if (!header.equals(PDF_MAGIC_BYTES)) {
    return res.status(400).json({ message: "Uploaded file is not a valid PDF" });
  }
  const generatedFilename = `${crypto.randomUUID()}.pdf`;
  const destination = path.join(uploadDir, generatedFilename);
  fs.writeFile(destination, req.file.buffer, (err) => {
    if (err) {
      console.error("Failed to persist CV upload:", err);
      return res.status(500).json({ message: "Unable to store CV upload" });
    }
    req.file.filename = generatedFilename;
    req.file.path = destination;
    req.file.originalName = req.file.originalname;
    next();
  });
};

// Fix (CV path-exposure audit): `candidateProfile.cv.path` is the file's
// location on this server's local disk (e.g. "uploads/cv/<uuid>.pdf"). It is
// only ever needed internally (to read/delete the file) and the frontend
// never reads it — exposing it in API responses gives a client unnecessary
// insight into the server's internal storage layout for no functional
// benefit. Strip it before any profile object leaves this service.
const sanitizeProfile = (profile) => {
  if (!profile) return profile;
  const plain = typeof profile.toObject === "function" ? profile.toObject() : profile;
  if (!plain.cv) return plain;
  const { path: _internalPath, ...safeCv } = plain.cv;
  return { ...plain, cv: safeCv };
};

// Fix (CV cleanup audit): best-effort delete of a CV file already written to
// disk. Used both when a request fails after the file was persisted (so it
// doesn't become an orphaned file with no matching profile record) and when
// a user uploads a replacement CV (so the old file doesn't linger forever).
// Failures here are logged, not thrown — a missing/undeletable old file
// should never block the user-facing request.
const deleteCvFileIfExists = (relativePath) => {
  if (!relativePath) return;
  fs.unlink(relativePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to remove CV file:", relativePath, err);
    }
  });
};

export const updatePersonalAndContact = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      address,
      city,
      state,
      country,
      pincode,
    } = req.body;

    if (![firstName, lastName, dateOfBirth, gender, phone, address, city, state, country, pincode].every(isNonEmptyString)) {
      return res
        .status(400)
        .json({ message: "All personal and contact fields are required" });
    }
    if (!isValidDate(dateOfBirth) || !["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ message: "Enter a valid date of birth and gender" });
    }

    // Fix (input-validation audit): presence was checked above, but a
    // string of any shape ("abc", "!!!") passed every check. These are
    // deliberately loose "shape" checks (phone: digits with optional
    // leading + and 7-15 digits total; pincode: 3-10 alphanumeric
    // characters, since postal-code formats vary by country and this
    // form's `country` field is free text, not India-only) — enough to
    // reject obvious garbage with a clear 400 without over-fitting to one
    // country's exact format.
    const digitsOnly = phone.replace(/[\s-]/g, "");
    if (!/^\+?[0-9]{7,15}$/.test(digitsOnly)) {
      return res.status(400).json({ message: "Enter a valid phone number" });
    }
    if (!/^[A-Za-z0-9]{3,10}$/.test(pincode.trim())) {
      return res.status(400).json({ message: "Enter a valid pincode/postal code" });
    }

    user.candidateProfile = {
      ...user.candidateProfile?.toObject(),
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      address,
      city,
      state,
      country,
      pincode,
    };

    await user.save();
    res.json({
      message: "Personal & contact details updated",
      profile: sanitizeProfile(user.candidateProfile),
    });
  } catch (err) {
    console.error("Error in updatePersonalAndContact:", err);
    res.status(500).json({ message: "Unable to update personal details" });
  }
};

export const updateOtherDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let education, skills, languages, sectorOfInterest, preferences;
    try {
      education = req.body.education ? JSON.parse(req.body.education) : [];
      skills = req.body.skills ? JSON.parse(req.body.skills) : [];
      languages = req.body.languages ? JSON.parse(req.body.languages) : [];
      sectorOfInterest = req.body.sectorOfInterest ? JSON.parse(req.body.sectorOfInterest) : [];
      preferences = req.body.preferences ? JSON.parse(req.body.preferences) : {};
    } catch {
      // Fix (CV cleanup audit): `persistCvUpload` already wrote req.file to
      // disk (it runs before this handler in the route chain) before any of
      // these validations run. Every early-return below used to leave that
      // file orphaned on disk with no profile ever pointing at it. Delete it
      // on every validation failure path from here on.
      deleteCvFileIfExists(req.file?.path);
      return res.status(400).json({ message: "Profile fields must contain valid JSON" });
    }
    const experience = req.body.experience || "";

    if (
      !hasValidEducation(education) ||
      !hasNonEmptyStrings(skills) ||
      !hasValidLanguages(languages) ||
      !hasNonEmptyStrings(sectorOfInterest) ||
      !isNonEmptyString(preferences.duration) ||
      !isNonEmptyString(preferences.mode) ||
      !isNonEmptyString(preferences.locationPref)
    ) {
      deleteCvFileIfExists(req.file?.path);
      return res
        .status(400)
        .json({ message: "All other details are required" });
    }

    if (!req.file && !user.candidateProfile?.cv?.filename) {
      return res.status(400).json({ message: "CV upload is required for a new profile" });
    }

    // Fix (CV cleanup audit): if this profile already has a CV on disk and
    // the user is uploading a replacement, remember the old path so it can
    // be removed once the new one is safely saved — otherwise every
    // re-upload leaves the previous file behind forever.
    const previousCvPath = user.candidateProfile?.cv?.path;

    const cvAnalysis = req.file
      ? await analyzeCvFile(req.file.path)
      : user.candidateProfile?.cvAnalysis || { status: "unknown", skills: [], education: [], experience: [], projects: [], certifications: [] };

    user.candidateProfile = {
      ...user.candidateProfile?.toObject(),
      education,
      skills,
      languages,
      sectorOfInterest,
      experience,
      preferences,
      cv: req.file ? {
        filename: req.file.filename,
        originalName: req.file.originalName,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
      } : user.candidateProfile.cv,
      cvAnalysis,
    };

    try {
      await user.save();
    } catch (saveErr) {
      // The new file was already persisted to disk above but the database
      // write failed, so the profile doesn't actually reference it — clean
      // it up rather than leaving an orphan.
      deleteCvFileIfExists(req.file?.path);
      throw saveErr;
    }

    if (previousCvPath && req.file && previousCvPath !== req.file.path) {
      deleteCvFileIfExists(previousCvPath);
    }

    res.json({
      message: "Other details updated",
      profile: sanitizeProfile(user.candidateProfile),
    });
  } catch (err) {
    console.error("Error in updateOtherDetails:", err);
    res.status(500).json({ message: "Unable to update profile details" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(sanitizeProfile(user.candidateProfile) || {});
  } catch (err) {
    console.error("Error in getProfile:", err);
    res.status(500).json({ message: "Unable to load profile" });
  }
};
