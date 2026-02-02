/**
 * Chat routes
 * Defines endpoint for AI-powered chat functionality with role-based access
 */

const express = require("express");
const router = express.Router();
const { askBot } = require("../controllers/chat.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorization.middleware");

// Chat endpoint - requires authentication, available to all authenticated users
router.post("/", verifyToken, authorize(["admin", "user"]), askBot);

module.exports = router;