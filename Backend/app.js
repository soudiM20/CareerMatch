import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import internshipRoutes from "./routes/internshipRoutes.js";

dotenv.config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "replace-with-a-long-random-secret") {
  throw new Error("JWT_SECRET must be set to a strong, non-placeholder value");
}
if (!process.env.FLASK_SERVICE_TOKEN || process.env.FLASK_SERVICE_TOKEN === "replace-with-a-long-random-service-token") {
  throw new Error("FLASK_SERVICE_TOKEN must be set to a strong, non-placeholder value");
}
connectDB();

const app = express();
const allowedOrigins = (process.env.FRONTEND_URLS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Fix (security-headers audit): no security headers were set at all. This
// project doesn't render HTML or serve third-party scripts, so a full
// Content-Security-Policy isn't meaningful here — these are the small set
// of headers that matter for a JSON API and cost nothing to add. Hand-rolled
// instead of pulling in the `helmet` package, since this project's actual
// needs are a handful of headers, not the wider hardening surface Helmet
// covers (much of which targets HTML-serving apps).
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("X-Frame-Options", "DENY");
  res.set("Referrer-Policy", "no-referrer");
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS_NOT_ALLOWED"));
  },
  credentials: true,
}));

app.use(express.json({ limit: "100kb" }));

// Simple liveness check — no DB round-trip, just confirms the process is up
// and responding. Useful for container orchestrators / uptime checks.
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Fix (observability audit): liveness (above) intentionally never checks
// dependencies, so it can't tell an operator "MongoDB is down" — it can only
// ever say the Node process itself is running. This readiness check reports
// the one dependency Node owns directly (MongoDB, via mongoose's connection
// state). It does NOT also probe Flask here: a readiness check that fans out
// to another network service becomes a second point of failure and adds
// latency to something orchestrators may poll every few seconds. Flask's own
// dependency health is exposed on its own /health endpoint (see ML/app.py) —
// a caller that needs both dependencies' status checks both endpoints,
// rather than Node reporting on a service it doesn't own.
const MONGOOSE_READY_STATE = 1; // mongoose.ConnectionStates.connected
app.get("/api/ready", (req, res) => {
  const mongoReady = mongoose.connection.readyState === MONGOOSE_READY_STATE;
  res.status(mongoReady ? 200 : 503).json({
    status: mongoReady ? "ready" : "not_ready",
    dependencies: { mongodb: mongoReady ? "connected" : "disconnected" },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/internships", internshipRoutes);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) return res.status(400).json({ message: "Invalid JSON payload" });
  if (err.name === "MulterError" || err.message === "Only PDF CV uploads are accepted") {
    return res.status(400).json({ message: err.message });
  }
  // Fix (CORS audit): a blocked origin previously fell through to the
  // generic `console.error(err); 500` branch below, logging every rejected
  // cross-origin request as if it were an unexpected server fault. It's an
  // expected, well-understood outcome — a plain 403 with no server-side
  // noise is the honest response.
  if (err.message === "CORS_NOT_ALLOWED") {
    return res.status(403).json({ message: "This origin is not permitted to access the API" });
  }
  console.error(err);
  return res.status(500).json({ message: "Unexpected server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
