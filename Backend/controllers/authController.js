import User from "../models/User.js";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

// Precomputed bcrypt hash of a random, unguessable string, used only to give
// the "no such user" branch of login() a bcrypt.compare() call to perform so
// that its response time matches the "wrong password" branch (constant-time
// enumeration defense; not a real credential).
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8sZ8L5xy9M6PmwF5oyLmMx5o1jw4Ke";

// Fix (input-validation audit): register() previously only checked that
// `email` was present (any non-empty string, including "not-an-email"), not
// that it looked like an email at all. This is intentionally a loose
// "shape" check (one @ with something on each side) rather than a strict
// RFC 5322 validator — the goal is catching obvious garbage input with a
// clear 400, not gatekeeping every edge case of real-world email syntax.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !EMAIL_SHAPE.test(email) || !password || password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: "Provide a valid email and a password between 8 and 72 characters" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({ message: "Unable to register user" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email });
    // Fix (login user-enumeration audit): a nonexistent email used to return
    // 404 "User not found" while a wrong password returned 401 "Invalid
    // credentials" — two different status codes/messages let an attacker
    // enumerate which emails are registered. Both cases now return the same
    // generic 401 response. `match` is still computed against a real bcrypt
    // hash either way so a missing user doesn't respond measurably faster.
    const match = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, DUMMY_HASH);
    if (!user || !match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ message: "Unable to log in" });
  }
};
