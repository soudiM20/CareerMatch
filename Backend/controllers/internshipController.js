import Internship from "../models/Internship.js";
import User from "../models/User.js";
import { getRecommendationsFromFlask } from "../services/flaskService.js";
import { literalRegex } from "../utils/searchRegex.js";
import { startOfToday } from "../utils/dates.js";
import { validateRecommendationRequest } from "../utils/recommendationValidation.js";
import { locationQuery } from "../utils/location.js";
import { publicInternship, publicInternshipSummary } from "../utils/publicInternship.js";
import { matchesRequiredSkills } from "../utils/skills.js";
import crypto from "crypto";

// Get all internships
export const getInternships = async (req, res) => {
  try {
    const { role, location, workMode, skills } = req.query;
    const query = {
      // Fix (deadline-semantics audit): was `{ $gte: new Date() }`, which
      // compared against the exact current instant rather than the start of
      // today — an internship disappeared from listings the moment the
      // clock passed midnight on its deadline day, hours before that day
      // was actually over, and out of step with ML/app.py's day-normalized
      // comparison. startOfToday() makes "deadline day still counts as
      // active" true in both services.
      Application_Deadline: { $gte: startOfToday() },
    };
    if (role) query.$or = [
      { Internship_Title: literalRegex(role) },
      { Area_Field: literalRegex(role) },
      { Sector: literalRegex(role) },
    ];
    const locationFilter = locationQuery(location);
    if (locationFilter) query.$and = locationFilter.$and;
    if (workMode) query.Mode = literalRegex(workMode);
    const internships = await Internship.find(query).sort({ createdAt: -1 }).lean();
    const matchingInternships = skills
      ? internships.filter((internship) => matchesRequiredSkills(internship.Required_Skills, skills))
      : internships;
    res.json(matchingInternships.slice(0, 100).map(publicInternshipSummary));
  } catch (err) {
    console.error("Error in getInternships:", err);
    res.status(500).json({ message: "Unable to load internships" });
  }
};
export const getInternshipById = async (req, res) => {
  try {
    const { id } = req.params; // id = Internship_ID from URL
    const internship = await Internship.findOne({ Internship_ID: id, Application_Deadline: { $gte: startOfToday() } }).lean();
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.json(publicInternship(internship));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to load internship" });
  }
};

// Get recommendations (send profile + preferences to Flask API)
export const getRecommendations = async (req, res) => {
  try {
    if (!req.user.candidateProfile) {
      return res.status(400).json({ message: "Please complete profile first" });
    }

    const profile = req.user.candidateProfile;

    // Data-minimized payload for the ML service: only fields the recommender
    // actually reads (skills, education field of study, sector, mode/location
    // preference). Name, DOB, gender, phone, address, and CV metadata are
    // never used by ML/app.py's candidate_text()/scoring, so they are kept
    // inside the Node/Mongo boundary instead of being sent to Flask.
    // Fix (education-feature audit): candidate_text() in ML/app.py reads
    // both `degree` and `fieldOfStudy` off each education entry, but this
    // payload previously sent only `fieldOfStudy` — `degree` was silently
    // always empty on the Flask side even though users fill it in and it's
    // stored on the User model. `institution` and `grade` are still
    // withheld deliberately: neither is read anywhere in candidate_text()
    // or scoring, so sending them would just be unused PII.
    const profileData = {
      skills: profile.skills || [],
      education: (profile.education || []).map((entry) => ({
        degree: entry.degree,
        fieldOfStudy: entry.fieldOfStudy,
      })),
      sectorOfInterest: profile.sectorOfInterest || [],
      preferences: {
        duration: profile.preferences?.duration || null,
        mode: profile.preferences?.mode || null,
        locationPref: profile.preferences?.locationPref || null,
      },
      cvAnalysis: profile.cvAnalysis || null,
    };

    // Send to Flask service. Now a POST endpoint (see routes/internshipRoutes.js),
    // so filters travel in the request body rather than the query string.
    const body = req.body || {};
    // Fix (Node input-validation audit): reject malformed filters before
    // spending a Mongo lookup or a Flask round-trip on them.
    const { valid, errors } = validateRecommendationRequest(body);
    if (!valid) {
      return res.status(400).json({ message: "Invalid recommendation filters.", errors });
    }
    const filters = {
      role: body.role,
      location: body.location,
      work_mode: body.workMode,
      required_skills: body.skills,
      min_match_score: body.minMatchScore,
    };
    const flaskResponse = await getRecommendationsFromFlask(profileData, filters);

    // Flask returns explainable recommendation metadata keyed by Internship_ID.
    if (!flaskResponse.ids || !Array.isArray(flaskResponse.ids)) {
      return res.status(500).json({ message: "Invalid response from ML service" });
    }

    // Fetch full internship documents from MongoDB
    // Fix (defense-in-depth audit): Flask's own dataset already excludes
    // expired internships, but this query is the only thing standing
    // between "Flask's CSV snapshot" and "what the user is shown" — if the
    // CSV and MongoDB ever drift out of sync (e.g. a deadline passed since
    // Flask last loaded, or Flask is running against a stale copy), an
    // already-expired internship could still be returned here. Re-apply the
    // same active-deadline rule Node uses everywhere else, using the same
    // calendar-day helper, rather than trusting Flask's filtering alone.
    let internships = await Internship.find({
      Internship_ID: { $in: flaskResponse.ids },
      Application_Deadline: { $gte: startOfToday() },
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
      ...publicInternshipSummary(internship),
      recommendation: explanationById[internship.Internship_ID] || null,
    }));

    const generatedAt = new Date();
    const batchId = crypto.randomUUID();
    const historyEntries = response.slice(0, 10).map(item => ({
      internshipId: item.Internship_ID,
      internshipTitle: item.Internship_Title,
      companyName: item.Company_Name,
      matchScore: item.recommendation?.match_score,
      missingSkills: item.recommendation?.missing_skills || [],
      generatedAt,
      batchId,
      filters: {
        role: filters.role || undefined,
        location: filters.location || undefined,
        workMode: filters.work_mode || undefined,
        requiredSkills: filters.required_skills || undefined,
        minMatchScore: filters.min_match_score !== undefined ? Number(filters.min_match_score) : undefined,
      },
      algorithmVersion: flaskResponse.algorithmVersion,
      scoreWeightsVersion: flaskResponse.scoreWeightsVersion,
    }));
    // Fix (recommendation-history audit): the results page calls this
    // endpoint on every mount, including on a plain browser refresh, which
    // previously appended a fresh history batch each time even when the
    // filters and underlying data hadn't changed — the 30-entry history
    // filled up with duplicates of the same recommendation instead of
    // reflecting distinct recommendation events. Skip the write when the
    // most recent stored batch already covers the exact same set of
    // internship IDs and was generated within the last 5 minutes.
    const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;
    const newIds = historyEntries.map((entry) => entry.internshipId).join(",");
    const existingHistory = req.user.recommendationHistory || [];
    const previousBatch = existingHistory.slice(-historyEntries.length);
    const previousIds = previousBatch.map((entry) => entry.internshipId).join(",");
    const previousGeneratedAt = previousBatch[previousBatch.length - 1]?.generatedAt;
    const filterFingerprint = JSON.stringify(historyEntries[0]?.filters || {});
    const previousFilterFingerprint = JSON.stringify(previousBatch[0]?.filters || {});
    const isDuplicateOfLastBatch =
      historyEntries.length > 0 &&
      newIds === previousIds &&
      filterFingerprint === previousFilterFingerprint &&
      previousGeneratedAt &&
      Date.now() - new Date(previousGeneratedAt).getTime() < DUPLICATE_WINDOW_MS;

    if (historyEntries.length && !isDuplicateOfLastBatch) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { recommendationHistory: { $each: historyEntries, $slice: -30 } },
      });
    }
    res.json(response);

  } catch (err) {
    // Fix (Node<->Flask reliability audit): flaskService now tags a real
    // Flask response with `status` + `isFlaskResponse` so a clean 4xx
    // validation rejection reaches the client as the 4xx it actually is
    // (with Flask's own message), instead of always becoming a generic 500.
    // A genuine connectivity failure (no `err.status`, or an unexpected
    // thrown error elsewhere in this handler) still falls back to a plain
    // 500 with no internal detail leaked.
    if (err.isFlaskResponse) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("Error in getRecommendations:", err);
    return res.status(err.status || 500).json({
      message: err.status === 502 ? err.message : "Unable to generate recommendations right now",
    });
  }
};

export const getRecommendationHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("recommendationHistory").lean();
    const entries = user?.recommendationHistory || [];
    const batches = [];
    const batchIndexes = new Map();
    entries.forEach((entry) => {
      const key = entry.batchId || new Date(entry.generatedAt).getTime();
      if (!batchIndexes.has(key)) {
        batchIndexes.set(key, batches.length);
        batches.push([]);
      }
      batches[batchIndexes.get(key)].push(entry);
    });
    res.json(batches.reverse().flat());
  } catch (err) {
    res.status(500).json({ message: "Unable to load recommendation history" });
  }
};

export const searchInternships = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query is required" });

    // Fix: user input is escaped before being used as a regex (was previously
    // passed straight into `new RegExp`, allowing regex metacharacters /
    // catastrophic-backtracking patterns to be injected).
    const regex = literalRegex(query);

    const internships = await Internship.find({
      // Fix (deadline-semantics audit): same startOfToday() correction as
      // getInternships above — search must agree with listing on what
      // "still open" means.
      Application_Deadline: { $gte: startOfToday() },
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
    }).limit(50).lean();

    res.json(internships.map(publicInternshipSummary));
  } catch (err) {
    console.error("Error in searchInternships:", err);
    res.status(500).json({ message: "Unable to search internships" });
  }
};
