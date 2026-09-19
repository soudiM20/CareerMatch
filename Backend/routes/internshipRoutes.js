import express from "express";
import { getInternships, getRecommendations, getRecommendationHistory, searchInternships, getInternshipById} from "../controllers/internshipController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getInternships);
// Fix (recommendation API-design audit): generating a recommendation is not
// idempotent or side-effect-free — it writes a recommendationHistory record
// on every call — so it belongs on POST, not GET. GET was previously used
// for both generating recommendations *and* recording history in the same
// request, which conflates "read" and "write" semantics on one verb.
router.post("/recommend", protect, getRecommendations);
router.get("/recommend/history", protect, getRecommendationHistory);
router.get("/search", searchInternships);
router.get("/:id", getInternshipById);

export default router;
