/**
 * Authentication routes
 * Defines endpoints for user registration and login
 */

const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");

// User registration endpoint
router.post("/register", register);

// User login endpoint
router.post("/login", login);

module.exports = router;
