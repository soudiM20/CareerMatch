import axios from "axios";

const FLASK_API_URL = process.env.FLASK_API_URL || "http://localhost:5001/recommend_candidate";

export const getRecommendationsFromFlask = async (profileData, filters = {}) => {
  try {
    const res = await axios.post(FLASK_API_URL,  {
  profile: profileData,
  filters,
  top_k: 20
}, {
      headers: {
        "Content-Type": "application/json",
        "X-ML-Service-Token": process.env.FLASK_SERVICE_TOKEN,
      },
      timeout: 10000, // 10s timeout
    });
    return res.data;
  } catch (err) {
    // Fix (Node<->Flask reliability audit): every failure here — a real
    // network problem AND a clean 4xx validation rejection from Flask
    // (axios throws on non-2xx too) — used to collapse into the same
    // generic thrown Error, which the controller then reported as a bare
    // 500 "Unable to generate recommendations right now". That mislabels a
    // client-fixable validation error as a server fault and throws away
    // Flask's actual message. Distinguish the two cases:
    if (err.response) {
      // Flask was reached and responded with a non-2xx status — a
      // validation problem, not a connectivity problem. Preserve its
      // status and message (Flask's error bodies here are always the
      // small, clean client-facing strings from app.py's own 400 checks,
      // never a stack trace) so the controller can pass them through.
      const flaskError = new Error(err.response.data?.message || "The recommendation service rejected this request.");
      flaskError.status = err.response.status;
      flaskError.isFlaskResponse = true;
      throw flaskError;
    }
    // No response at all: connection refused, DNS failure, or the 10s
    // timeout — Flask itself is unreachable. That's a bad-gateway (502)
    // from Node's perspective, not "our fault" (500).
    console.error("Flask API error:", err.message);
    const unavailable = new Error("The recommendation service is currently unavailable. Please try again shortly.");
    unavailable.status = 502;
    throw unavailable;
  }
};
