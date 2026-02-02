/**
 * Authentication routes
 * Defines endpoints for user registration, login, and role management
 */

const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  getProfile,
  updateUserRole,
  getAllUsers,
  getUserById
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/authorization.middleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes - requires authentication
router.get("/profile", verifyToken, getProfile);
router.get("/user/:userId", verifyToken, getUserById);

// Admin routes - requires admin role
router.get("/users", verifyToken, adminOnly, getAllUsers);
router.put("/user/role", verifyToken, adminOnly, updateUserRole);

module.exports = router;
