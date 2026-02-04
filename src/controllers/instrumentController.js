/**
 * Instrument controller
 * Handles gemological instrument operations (retrieve, create, status update, and delete)
 */

const Tool = require('../models/tool');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "gemora-instruments",
        public_id: filename.split('.')[0],
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    
    const readable = Readable.from(buffer);
    readable.pipe(stream);
  });
};

// Retrieve all instruments from database
const getInstruments = async (req, res) => {
  try {
    // If admin is logged in, show all. Otherwise, only show approved instruments.
    const query = req.user && req.user.role === 'admin' ? {} : { status: 'Approved' };
    
    const instruments = await Tool.find(query);
    
    // Ensure images array always exists
    const sanitizedInstruments = instruments.map(instrument => {
      const i = instrument.toObject();
      if (!i.images) i.images = i.imageUrl ? [i.imageUrl] : [];
      return i;
    });
    
    res.json(sanitizedInstruments);
  } catch (error) {
    console.error("GET INSTRUMENTS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get a single instrument by ID
const getInstrumentById = async (req, res) => {
  try {
    const instrument = await Tool.findById(req.params.id);

    if (!instrument) {
      return res.status(404).json({ message: "Instrument not found" });
    }

    // Ensure images array always exists
    const sanitizedInstrument = instrument.toObject();
    if (!sanitizedInstrument.images || !Array.isArray(sanitizedInstrument.images)) {
      sanitizedInstrument.images = sanitizedInstrument.imageUrl ? [sanitizedInstrument.imageUrl] : [];
    }

    res.json(sanitizedInstrument);
  } catch (error) {
    res.status(500).json({ message: "Invalid ID format or Server Error" });
  }
};

// Create and save a new instrument product
const createInstrument = async (req, res) => {
  try {
    console.log("🔍 [createInstrument] Request body:", JSON.stringify(req.body, null, 2));
    console.log("🔍 [createInstrument] Files uploaded:", req.files ? req.files.length : 0);

    const { name, brand, category, price, countInStock, description } = req.body;

    // Check authentication
    if (!req.user) {
      console.warn("⚠️ [createInstrument] No user - not authenticated");
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!req.files || req.files.length === 0) {
      console.warn("⚠️ [createInstrument] No images provided");
      return res.status(400).json({ message: "At least one image is required" });
    }

    // Validate required fields
    if (!name || !brand || !category || !price) {
      console.warn("⚠️ [createInstrument] Missing required fields");
      return res.status(400).json({ message: "Name, brand, category, and price are required" });
    }

    console.log("📸 [createInstrument] Uploading", req.files.length, "images to Cloudinary...");

    // Upload all files to Cloudinary
    const imageUrls = [];
    for (const file of req.files) {
      try {
        const url = await uploadToCloudinary(file.buffer, file.originalname);
        imageUrls.push(url);
        console.log("✅ [createInstrument] Image uploaded:", url);
      } catch (uploadError) {
        console.error("❌ [createInstrument] Cloudinary upload failed:", uploadError);
        return res.status(400).json({ 
          message: "Failed to upload image to Cloudinary", 
          error: uploadError.message 
        });
      }
    }

    const instrument = new Tool({
      name, 
      brand, 
      category, 
      price, 
      countInStock, 
      description, 
      images: imageUrls
    });

    const createdInstrument = await instrument.save();
    console.log("✅ [createInstrument] Instrument created successfully:", createdInstrument._id);
    res.status(201).json(createdInstrument);
  } catch (error) {
    console.error("❌ [createInstrument] ERROR:", error);
    res.status(400).json({ message: "Invalid data", error: error.message });
  }
};

// Update the status of a specific instrument
const updateInstrumentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const instrument = await Tool.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true } // Return the updated document
    );
    if (!instrument) return res.status(404).json({ message: "Instrument not found" });
    res.json(instrument);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk approve all pending instruments (Admin only)
const bulkApproveInstruments = async (req, res) => {
  try {
    const result = await Tool.updateMany(
      { status: 'Pending' },
      { status: 'Approved' }
    );
    
    res.json({ 
      message: `Successfully approved ${result.modifiedCount} instruments`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("BULK APPROVE INSTRUMENTS ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete an instrument by ID (Admin only)
const deleteInstrument = async (req, res) => {
  try {
    console.log("Deleting ID:", req.params.id);
    
    // Find the instrument first to check if it exists
    const instrument = await Tool.findByIdAndDelete(req.params.id);
    
    if (!instrument) {
      console.warn("⚠️ [deleteInstrument] Instrument not found with ID:", req.params.id);
      return res.status(404).json({ message: "Instrument not found in database" });
    }
    
    console.log("✅ [deleteInstrument] Instrument deleted successfully:", req.params.id);
    res.status(200).json({ message: "Instrument deleted successfully", deletedInstrument: instrument });
  } catch (error) {
    console.error("❌ [deleteInstrument] ERROR:", error);
    res.status(500).json({ message: "Server error during deletion", error: error.message });
  }
};

module.exports = { 
  getInstruments, 
  getInstrumentById,
  createInstrument, 
  updateInstrumentStatus, 
  bulkApproveInstruments,
  deleteInstrument 
};
