/**
 * Tool routes
 * Defines endpoints for retrieving and creating gemological tools with role-based access
 */

const express = require("express");
const router = express.Router();
const { getTools, createTool, updateToolStatus } = require("../controllers/tool.controller");
const { verifyToken, optionalToken } = require("../middleware/auth.middleware");
const { authorize, adminOnly } = require("../middleware/authorization.middleware");

// Retrieve all tools - public or authenticated
router.get("/", optionalToken, getTools);

// Create a new tool - user or admin
router.post("/", verifyToken, authorize(["admin", "user"]), createTool);

// Update tool status - user or admin
router.put("/:id/status", verifyToken, authorize(["admin", "user"]), updateToolStatus);

module.exports = router;