/**
 * Gem routes
 * Defines endpoints for retrieving and creating gems with role-based access
 */

const express = require("express");
const router = express.Router();
const { getGems, createGem } = require("../controllers/gemController");
const { verifyToken, optionalToken } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorization.middleware");

// Retrieve all gems - public or authenticated
router.get("/", optionalToken, getGems);

// Create a new gem - requires authentication, admin or user can create
router.post("/", verifyToken, authorize(["admin", "user"]), createGem);

module.exports = router;