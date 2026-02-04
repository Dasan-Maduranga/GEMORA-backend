/**
 * Gem routes
 * Defines endpoints for retrieving and creating gems with role-based access
 */

const express = require("express");
const router = express.Router();
const { getGems, getLatestGems, createGem, approveGem, getSellerByGemId, bulkApproveGems, updateGemStatus } = require("../controllers/gemController");
const { verifyToken, optionalToken } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorization.middleware");
const upload = require("../middleware/multer");

// Retrieve gems (optionalToken populated req.user for the admin check)
router.get("/", optionalToken, getGems);

router.get("/latest", getLatestGems);

// Get seller details by gem ID - for "Contact Now" button
router.get("/:gemId/seller", getSellerByGemId);

// Create a new gem - with image upload support (up to 5 images)
router.post("/", verifyToken, authorize(["admin", "user"]), upload.array("images", 5), createGem);

// router.post("/add-gems",)

// Update gem status (Pending/Approved/Rejected) - Admin or User
router.put("/:id/status", verifyToken, authorize(["admin", "user"]), updateGemStatus);

// 🔹 Admin-only route to approve gems (backward compatibility)
router.put("/:id/approve", verifyToken, authorize(["admin"]), approveGem);

// 🔹 Bulk approve all gems (Admin only)
router.put("/bulk/approve", verifyToken, authorize(["admin"]), bulkApproveGems);

module.exports = router;