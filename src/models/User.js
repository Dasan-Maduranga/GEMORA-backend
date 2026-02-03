/**
 * User model
 * Defines schema for user accounts with authentication fields
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profileImage: { type: String }, // 👈 Profile image URL from Cloudinary
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
