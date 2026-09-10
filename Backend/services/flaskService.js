import axios from "axios";

const FLASK_API_URL = process.env.FLASK_API_URL || "http://localhost:5001/recommend_candidate";

export const getRecommendationsFromFlask = async (profileData, filters = {}) => {
  try {
    const res = await axios.post(FLASK_API_URL,  {
  profile: profileData,
  filters,
  top_k: 20
}, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000, // 10s timeout
    });
    return res.data;
  } catch (err) {
    console.error("Flask API error:", err.message);
    throw new Error("Error fetching recommendations from Flask API");
  }
};
