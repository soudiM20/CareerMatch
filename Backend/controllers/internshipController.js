import Internship from "../models/Internship.js";
import User from "../models/User.js";
import { getRecommendationsFromFlask } from "../services/flaskService.js";

// Get all internships
export const getInternships = async (req, res) => {
  try {
    const { role, location, workMode, skills } = req.query;
    const query = {};
    if (role) query.$or = [
      { Internship_Title: new RegExp(role, "i") },
      { Area_Field: new RegExp(role, "i") },
      { Sector: new RegExp(role, "i") },
    ];
    if (location) query.Internship_State = new RegExp(location, "i");
    if (workMode) query.Mode = new RegExp(workMode, "i");
    if (skills) query.Required_Skills = { $in: skills.split(",").map(skill => new RegExp(skill.trim(), "i")) };
    const internships = await Internship.find(query).sort({ createdAt: -1 }).limit(100).lean();
    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getInternshipById = async (req, res) => {
  try {
    const { id } = req.params; // id = Internship_ID from URL
    const internship = await Internship.findOne({ Internship_ID: id });
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.json(internship);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get recommendations (send profile + preferences to Flask API)
export const getRecommendations = async (req, res) => {
  try {
    if (!req.user.candidateProfile) {
      return res.status(400).json({ message: "Please complete profile first" });
    }

    const profile = req.user.candidateProfile;

    // Full candidate profile payload
    const profileData = {
      personal: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
      },
      contact: {
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        pincode: profile.pincode,
      },
      education: profile.education || [],
      skills: profile.skills || [],
      languages: profile.languages || [],
      sectorOfInterest: profile.sectorOfInterest || [],
      experience: profile.experience || null,
      preferences: {
        duration: profile.preferences?.duration || null,
        mode: profile.preferences?.mode || null,
        locationPref: profile.preferences?.locationPref || null,
      },
      cv: profile.cv || {},
    };

    // Send to Flask service
    const filters = {
      role: req.query.role,
      location: req.query.location,
      work_mode: req.query.workMode,
      required_skills: req.query.skills,
      min_match_score: req.query.minMatchScore,
    };
    const flaskResponse = await getRecommendationsFromFlask(profileData, filters);

    // Flask returns explainable recommendation metadata keyed by Internship_ID.
    if (!flaskResponse.ids || !Array.isArray(flaskResponse.ids)) {
      return res.status(500).json({ message: "Invalid response from ML service" });
    }

    // Fetch full internship documents from MongoDB
    let internships = await Internship.find({
      Internship_ID: { $in: flaskResponse.ids }
    });

    // Optional: reorder according to ML ranking
    const idToInternship = {};
    internships.forEach(i => { idToInternship[i.Internship_ID] = i; });

    const orderedInternships = flaskResponse.ids
      .map(id => idToInternship[id])
      .filter(Boolean); // remove any missing

    const explanationById = Object.fromEntries(
      (flaskResponse.recommendations || []).map(item => [item.internship_id, item])
    );
    const response = orderedInternships.map(internship => ({
      ...internship.toObject(),
      recommendation: explanationById[internship.Internship_ID] || null,
    }));

    const historyEntries = response.slice(0, 10).map(item => ({
      internshipId: item.Internship_ID,
      internshipTitle: item.Internship_Title,
      companyName: item.Company_Name,
      matchScore: item.recommendation?.match_score,
      missingSkills: item.recommendation?.missing_skills || [],
      generatedAt: new Date(),
    }));
    if (historyEntries.length) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { recommendationHistory: { $each: historyEntries, $slice: -30 } },
      });
    }
    res.json(response);

  } catch (err) {
    console.error("Error in getRecommendations:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getRecommendationHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("recommendationHistory").lean();
    res.json(user?.recommendationHistory?.slice().reverse() || []);
  } catch (err) {
    res.status(500).json({ message: "Unable to load recommendation history" });
  }
};

export const searchInternships = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const regex = new RegExp(query, "i"); // case-insensitive

    const internships = await Internship.find({
      $or: [
        { Internship_Title: regex },
        { Company_Name: regex },
        { Sector: regex },
        { Area_Field: regex },
        { Required_Skills: regex },
        { Internship_State: regex },
        { Internship_District: regex },
        { Benefits: regex },
        { Company_Description: regex },
        { Stipend_Type: regex },
        { Requirement_Contact: regex },
        { Eligibility_Education: regex },
        { Eligibility_Experience: regex },
        { Eligibility_Description: regex },
        { Hiring_Workflow: regex },
      ]
    }).limit(50);

    res.json(internships);
  } catch (err) {
    console.error("Error in searchInternships:", err.message);
    res.status(500).json({ message: err.message });
  }
};
