import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  // Step 1: Personal Details
  // The profile is deliberately saved in two separate requests (personal
  // details first, then education/preferences/CV). These fields therefore
  // cannot be schema-required: Mongoose validates the whole embedded
  // document on each save and would reject the legitimate first-stage save
  // before the second-stage fields exist. Route-level validation enforces
  // the fields appropriate to each stage instead.
  firstName: { type: String },
  lastName: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["Male", "Female", "Other"] },

  // Step 2: Contact Details
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  pincode: { type: String },

  // Step 3: Education
  education: [
    {
      degree: { type: String },
      institution: { type: String },
      fieldOfStudy: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      grade: { type: String },
    },
  ],

  // Step 4: Skills & Languages
  skills: [{ type: String }],
  languages: [
    {
      name: { type: String },
      proficiency: { type: String }, // Beginner, Intermediate, Fluent, Native
    },
  ],

  // Step 5: Other Info
  sectorOfInterest: [{ type: String }],
  experience: { type: String }, // Optional, can be "0" or description
  preferences: {
    duration: { type: String },
    mode: { type: String }, // Remote, On-site, Hybrid
    locationPref: { type: String },
  },

  // Step 6: CV Upload
  cv: {
    filename: { type: String}, // generated UUID filename on disk (never derived from user input)
    originalName: { type: String}, // original filename, kept as metadata only, never used to build a path
    path: { type: String},
    mimetype: { type: String},
    size: { type: Number}
  }
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Candidate profile (filled later)
    candidateProfile: candidateSchema,
    recommendationHistory: [{
      internshipId: { type: String, required: true },
      internshipTitle: String,
      companyName: String,
      matchScore: Number,
      missingSkills: [String],
      generatedAt: { type: Date, default: Date.now },
      // Fix (recommendation-history/versioning audit): tag each stored
      // recommendation with the exact filters and algorithm version that
      // produced it, so a later "why did this change?" question can be
      // answered by inspecting history instead of guessing from git log.
      filters: {
        role: String,
        location: String,
        workMode: String,
        requiredSkills: String,
        minMatchScore: Number,
      },
      algorithmVersion: String,
      scoreWeightsVersion: String,
    }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
