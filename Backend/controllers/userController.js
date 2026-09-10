import User from "../models/User.js";
import multer from "multer";
import fs from "fs";
const uploadDir = "uploads/cv";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/cv/"); // folder to store CVs
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error("Only PDF CV uploads are accepted"));
  },
});

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

    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !gender ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !country ||
      !pincode
    ) {
      return res
        .status(400)
        .json({ message: "All personal and contact fields are required" });
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
      profile: user.candidateProfile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
      return res.status(400).json({ message: "Profile fields must contain valid JSON" });
    }
    const experience = req.body.experience || "";

    if (
      !Array.isArray(education) || education.length === 0 ||
      !Array.isArray(skills) || skills.length === 0 ||
      !Array.isArray(languages) || languages.length === 0 ||
      !Array.isArray(sectorOfInterest) || sectorOfInterest.length === 0 ||
      !preferences.duration ||
      !preferences.mode ||
      !preferences.locationPref
    ) {
      return res
        .status(400)
        .json({ message: "All other details are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "CV upload is required" });
    }

    user.candidateProfile = {
      ...user.candidateProfile?.toObject(),
      education,
      skills,
      languages,
      sectorOfInterest,
      experience,
      preferences,
      cv: {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    };

    await user.save();
    res.json({
      message: "Other details updated",
      profile: user.candidateProfile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.candidateProfile || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
