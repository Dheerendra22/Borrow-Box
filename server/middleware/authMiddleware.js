const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

// protect: a middleware that runs BEFORE protected route handlers.
// It checks that the request carries a valid JWT in the Authorization header.
// If valid → attaches the user to req.user and calls next().
// If invalid or missing → sends 401 Unauthorized immediately.
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // The header must look like: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized — no token provided");
  }

  // Pull out just the token part after "Bearer "
  const token = authHeader.split(" ")[1];

  // jwt.verify throws if the token is expired, tampered with, or invalid
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized — token is invalid or expired");
  }

  // Look up the user by the id we stored in the token payload
  // We do NOT select the password — we never need it after login
  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error("Not authorized — user no longer exists");
  }

  // Attach the user document so any downstream handler can use it
  req.user = user;
  next();
});

module.exports = { protect };
