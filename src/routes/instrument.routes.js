/**
 * Instrument routes
 * Defines endpoints for managing gemological instruments with role-based access
 */

const express = require("express");
const router = express.Router();
const { 
  getInstruments, 
  getInstrumentById,
  createInstrument, 
  updateInstrumentStatus, 
  bulkApproveInstruments,
  deleteInstrument 
} = require("../controllers/instrumentController");
const { verifyToken, optionalToken } = require("../middleware/auth.middleware");
const { authorize, adminOnly } = require("../middleware/authorization.middleware");
const upload = require("../middleware/multer");

// Retrieve all instruments - public or authenticated
router.get("/", optionalToken, getInstruments);

// Retrieve a single instrument by ID - public or authenticated
router.get("/:id", optionalToken, getInstrumentById);

// Create a new instrument - user or admin with image upload support (up to 5 images)
router.post("/", verifyToken, authorize(["admin", "user"]), upload.array("image", 5), createInstrument);

// Update instrument status - user or admin
router.put("/:id/status", verifyToken, authorize(["admin", "user"]), updateInstrumentStatus);

// Bulk approve all pending instruments (Admin only)
router.put("/bulk/approve", verifyToken, authorize(["admin"]), bulkApproveInstruments);

// Delete an instrument - admin only
router.delete("/:id", verifyToken, adminOnly, deleteInstrument);

module.exports = router;
