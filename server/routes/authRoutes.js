const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register  — create a new account
router.post("/register", register);

// POST /api/auth/login  — log in with email + password, get a token
router.post("/login", login);

// GET /api/auth/me  — get the logged-in user's info (protected)
router.get("/me", protect, getMe);

module.exports = router;
