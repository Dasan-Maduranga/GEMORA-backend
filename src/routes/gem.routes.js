/**
 * Gem routes
 * Defines endpoints for retrieving and creating gems
 */

const express = require("express");
const router = express.Router();
const { getGems, createGem } = require("../controllers/gemController");

// Retrieve all gems
router.get("/", getGems);

// Create a new gem
router.post("/", createGem);

module.exports = router;