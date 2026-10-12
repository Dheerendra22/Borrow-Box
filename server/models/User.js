const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,         // MongoDB index — no two users share an email
      lowercase: true,      // always store as lowercase so "A@B.com" == "a@b.com"
      trim: true,
    },

    // select: false means the password field is NEVER returned in a
    // normal query — you have to explicitly ask for it with .select("+password")
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// ── Pre-save hook ─────────────────────────────────────────────────
// Runs BEFORE a user document is saved to the database.
// Only re-hashes the password when it was actually changed
// (so updating your name doesn't re-hash the existing password).
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // saltRounds: 10 is a good balance of speed vs security
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method ───────────────────────────────────────────────
// Called on a user document: await user.comparePassword("plainText")
// bcrypt.compare hashes the plain text with the same salt and checks
// if it matches the stored hash — we never un-hash the password.
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
