import express from "express";
import {
  updatePersonalAndContact,
  updateOtherDetails,
  getProfile,
  upload,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile/personal", protect, updatePersonalAndContact);
router.put("/profile/other", protect, upload.single("cv"), updateOtherDetails);

export default router;
