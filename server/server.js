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

// ─── 1. CORS FIRST — MUST RUN BEFORE HELMET & RATE LIMITERS ───────
// Browser OPTIONS preflight requests must receive CORS headers
// without being blocked by security headers or rate limits.
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ─── 2. Security Middleware ────────────────────────────────────────
// Helmet with cross-origin resource sharing adjustments
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// General rate limiter for all API endpoints (max 500 requests per 15 min)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});
app.use("/api", globalLimiter);

// Auth rate limiter (max 60 attempts per 15 min — generous for local development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login or registration attempts. Please try again after 15 minutes.",
  },
});
app.use("/api/auth", authLimiter);

// ─── 3. Global Body Parser & Logger ────────────────────────────────
app.use(express.json({ limit: "100kb" }));
app.use(morgan("dev"));

// ─── 4. Routes ────────────────────────────────────────────────────
// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "BorrowBox API running" });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Item routes
app.use("/api/items", itemRoutes);

// Borrow request routes
app.use("/api/requests", requestRoutes);

// ─── 5. Error Handlers (must come LAST) ───────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
