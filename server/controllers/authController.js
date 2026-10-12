const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

// ── Helper: validate email format with a simple regex ─────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ── Helper: build the user object we send back (no password) ──────
const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // ── Input validation ──────────────────────────────────────────
  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Name is required");
  }

  if (!email || !isValidEmail(email)) {
    res.status(400);
    throw new Error("A valid email is required");
  }

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  // ── Check for duplicate email ─────────────────────────────────
  // email is stored lowercase so we compare lowercase too
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409); // 409 Conflict
    throw new Error("An account with that email already exists");
  }

  // ── Create user (password gets hashed by the pre-save hook) ───
  const user = await User.create({ name: name.trim(), email, password });

  // ── Respond with the standard success shape ───────────────────
  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: sanitizeUser(user),
      token: generateToken(user._id),
    },
  });
});

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // ── Input validation ──────────────────────────────────────────
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  // ── Find user and explicitly include the password field ───────
  // (password has select:false, so we must ask for it here)
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  // ── Wrong email OR wrong password → same vague message ────────
  // (never tell the attacker which one was wrong)
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    success: true,
    message: "Logged in successfully",
    data: {
      user: sanitizeUser(user),
      token: generateToken(user._id),
    },
  });
});

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Protected (needs valid JWT)
// ─────────────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by the protect middleware — it already has
  // the user document without the password
  res.json({
    success: true,
    message: "User fetched successfully",
    data: sanitizeUser(req.user),
  });
});

module.exports = { register, login, getMe };
