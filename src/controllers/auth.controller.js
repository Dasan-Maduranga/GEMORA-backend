/**
 * Authentication controller
 * Handles user registration and login with JWT tokens
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token for authenticated user
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Register new user with email and password
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    // Hash password and create user
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    // Generate token and return user data
    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// Authenticate user and issue JWT token
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Verify password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // Generate token and return user data
    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};
