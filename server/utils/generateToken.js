const jwt = require("jsonwebtoken");

// generateToken: creates a signed JWT that proves who the user is.
// The token contains the user's _id as its "payload" (the data inside).
// It's signed using JWT_SECRET so the server can verify it wasn't tampered with.
// It expires after JWT_EXPIRES_IN (e.g. "7d"), after which the user must log in again.
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },               // payload — what we store inside the token
    process.env.JWT_SECRET,       // secret key used to sign it
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } // expiry
  );
};

module.exports = generateToken;
