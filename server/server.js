// Load environment variables from .env FIRST — before anything else
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const requestRoutes = require("./routes/requestRoutes");

const app = express();

// ─── Connect to MongoDB ───────────────────────────────────────────
connectDB();

// ─── Security Middleware ──────────────────────────────────────────

// Helmet sets secure HTTP response headers
app.use(helmet());

// General rate limiter for all API endpoints (max 300 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});
app.use("/api", globalLimiter);

// Stricter rate limiter specifically for auth endpoints (max 20 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login or registration attempts. Please try again after 15 minutes.",
  },
});
app.use("/api/auth", authLimiter);

// ─── Global Middleware ────────────────────────────────────────────

// Parse incoming JSON request bodies (limit payload to 100kb for safety)
app.use(express.json({ limit: "100kb" }));

// Allow requests from our React frontend (CLIENT_URL in .env)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // allow cookies / auth headers
  })
);

// Log every HTTP request to the console (method, path, status, time)
app.use(morgan("dev"));

// ─── Routes ──────────────────────────────────────────────────────

// Health check — a quick way to confirm the API is alive
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "BorrowBox API running" });
});

// Authentication routes: /api/auth/register, /api/auth/login, /api/auth/me
app.use("/api/auth", authRoutes);

// Item routes: /api/items (browse, create, view, delete)
app.use("/api/items", itemRoutes);

// Borrow request routes: /api/requests (create, mine, incoming, approve, reject, return)
app.use("/api/requests", requestRoutes);

// ─── Error Handlers (must come LAST) ─────────────────────────────

// Catch requests to routes that don't exist
app.use(notFound);

// Handle all errors and send { success: false, message } response
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
