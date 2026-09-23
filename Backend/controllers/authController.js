import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8sZ8L5xy9M6PmwF5oyLmMx5o1jw4Ke";
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";

export const register = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    if (!EMAIL_SHAPE.test(email) || !password || password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: "Provide a valid email and a password between 8 and 72 characters" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: "User already exists" });
    console.error("Error in register:", err);
    res.status(500).json({ message: "Unable to register user" });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email });
    const match = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, DUMMY_HASH);
    if (!user || !match) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ message: "Unable to log in" });
  }
};
