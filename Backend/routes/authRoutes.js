import express from "express";
import { register, login } from "../controllers/authController.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = express.Router();

// Fix (login security audit): unlimited login/register attempts allowed
// unbounded credential-stuffing / brute-force attempts against any account.
// 10 attempts per 15 minutes per IP+route is generous for a real user
// (including typos) while meaningfully slowing down automated guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many attempts. Please wait a few minutes and try again.",
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

export default router;
