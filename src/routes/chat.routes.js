/**
 * Chat routes
 * Defines endpoint for AI-powered chat functionality
 */

const express = require("express");
const router = express.Router();
const { askBot } = require("../controllers/chat.controller");

// Chat endpoint - POST request with user message
router.post("/", askBot);

module.exports = router;