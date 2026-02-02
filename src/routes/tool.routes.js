/**
 * Tool routes
 * Defines endpoints for retrieving and creating gemological tools
 */

const express = require("express");
const router = express.Router();
const { getTools, createTool } = require("../controllers/tool.controller");

// Retrieve all tools
router.get("/", getTools);

// Create a new tool
router.post("/", createTool);

module.exports = router;