/**
 * Gem routes
 * Defines endpoints for retrieving and creating gems with role-based access
 */

const express = require("express");
const router = express.Router();
const { getGems, getLatestGems, createGem, approveGem } = require("../controllers/gemController");
const { verifyToken, optionalToken } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorization.middleware");
const upload = require("../middleware/multer");

// Retrieve gems (optionalToken populated req.user for the admin check)
router.get("/", optionalToken, getGems);

router.get("/latest", getLatestGems);

// Create a new gem - with image upload support (up to 5 images)
router.post("/", verifyToken, authorize(["admin", "user"]), upload.array("images", 5), createGem);

// 🔹 Admin-only route to approve gems
router.put("/:id/approve", verifyToken, authorize(["admin"]), approveGem);

module.exports = router;