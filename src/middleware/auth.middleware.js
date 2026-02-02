/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user info to request
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Verify JWT token and attach user to request
 * Token should be sent in Authorization header as "Bearer <token>"
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * Optional: Verify token but don't fail if missing
 * Useful for routes that work with or without authentication
 */
exports.optionalToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (err) {
    // Silent fail - continue without user
    next();
  }
};
