import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  // Step 1: Personal Details
  firstName: { type: String , required:true},
  lastName: { type: String, required: true},
  dateOfBirth: { type: Date, required: true},
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true},

  // Step 2: Contact Details
  phone: { type: String, required:true },
  address: { type: String, required:true },
  city: { type: String, required:true },
  state: { type: String , required:true},
  country: { type: String , required:true},
  pincode: { type: String , required:true},

  // Step 3: Education
  education: [
    {
      degree: { type: String, required:true },
      institution: { type: String , required:true},
      fieldOfStudy: { type: String , required:true},
      startDate: { type: Date, required:true },
      endDate: { type: Date, required:true },
      grade: { type: String, required:true },
    },
  ],

  // Step 4: Skills & Languages
  skills: [{ type: String, required:true }],
  languages: [
    {
      name: { type: String },
      proficiency: { type: String }, // Beginner, Intermediate, Fluent, Native
    },
  ],

  // Step 5: Other Info
  sectorOfInterest: [{ type: String , required:true}],
  experience: { type: String }, // Optional, can be "0" or description
  preferences: {
    duration: { type: String },
    mode: { type: String }, // Remote, On-site, Hybrid
    locationPref: { type: String },
  },

  // Step 6: CV Upload
  cv: {
    filename: { type: String},
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
    }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
