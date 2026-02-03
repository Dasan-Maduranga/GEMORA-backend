/**
 * Gem controller
 * Handles gem product operations with admin approval
 */

const Gem = require('../models/gem');
const User = require('../models/User');
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
        folder: "gemora-gems",
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

// Retrieve gems - Regular users see ONLY approved; Admin sees ALL
const getGems = async (req, res) => {
  try {
    // If admin is logged in, show all. Otherwise, only show approved gems.
    const query = req.user && req.user.role === 'admin' ? {} : { isApproved: true };
    
    const gems = await Gem.find(query);
    
    // 🔹 Map through gems and ensure "images" always exists as an array
    const sanitizedGems = gems.map(gem => {
      const g = gem.toObject();
      if (!g.images) g.images = g.imageUrl ? [g.imageUrl] : [];
      return g;
    });

    res.json(sanitizedGems);
  } catch (error) {
    console.error("GET GEMS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getLatestGems = async (req, res) => {
  try {
    // Only show latest 4 APPROVED gems for the homepage
    const gems = await Gem.find({ isApproved: true }).sort({ createdAt: -1 }).limit(4);

    // 🔹 Ensure images array always exists
    const sanitizedGems = gems.map(gem => {
      const g = gem.toObject();
      if (!g.images) g.images = g.imageUrl ? [g.imageUrl] : [];
      return g;
    });

    res.json(sanitizedGems);
  } catch (error) {
    console.error("GET LATEST GEMS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 🔹 New function for Admin to approve a gem
const approveGem = async (req, res) => {
  try {
    const gem = await Gem.findByIdAndUpdate(
      req.params.id, 
      { isApproved: true }, 
      { new: true }
    );
    if (!gem) return res.status(404).json({ message: "Gem not found" });
    res.json({ message: "Gem approved and published!", gem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createGem = async (req, res) => {
  try {
    console.log("🔍 [createGem] Request body:", JSON.stringify(req.body, null, 2));
    console.log("🔍 [createGem] User:", req.user ? `${req.user._id} (${req.user.role})` : "NOT AUTHENTICATED");
    console.log("🔍 [createGem] Files uploaded:", req.files ? req.files.length : 0);

    const { name, carat, clarity, origin, price, countInStock, description } = req.body;

    // Check authentication
    if (!req.user) {
      console.warn("⚠️ [createGem] No user - not authenticated");
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!req.files || req.files.length === 0) {
      console.warn("⚠️ [createGem] No images provided");
      return res.status(400).json({ message: "At least one image is required" });
    }

    // Validate required fields
    if (!name || !carat || !price) {
      console.warn("⚠️ [createGem] Missing required fields:", { name, carat, price });
      return res.status(400).json({ message: "Name, carat, and price are required" });
    }

    console.log("📸 [createGem] Uploading", req.files.length, "images to Cloudinary...");

    // 🔹 Upload all files to Cloudinary
    const imageUrls = [];
    for (const file of req.files) {
      try {
        const url = await uploadToCloudinary(file.buffer, file.originalname);
        imageUrls.push(url);
        console.log("✅ [createGem] Image uploaded:", url);
      } catch (uploadError) {
        console.error("❌ [createGem] Cloudinary upload failed:", uploadError);
        return res.status(400).json({ 
          message: "Failed to upload image to Cloudinary", 
          error: uploadError.message 
        });
      }
    }

    console.log("📝 [createGem] Creating gem with", imageUrls.length, "images");

    const gem = new Gem({
      name,
      carat,
      clarity,
      origin,
      price,
      countInStock,
      description,
      images: imageUrls, // 👈 Array of Cloudinary URLs
      isApproved: req.user.role === 'admin' 
    });

    const createdGem = await gem.save();
    console.log("✅ [createGem] Gem created successfully:", createdGem._id);
    res.status(201).json(createdGem);
  } catch (error) {
    console.error("❌ [createGem] ERROR:", error);
    res.status(400).json({ 
      message: "Failed to create gem", 
      error: error.message
    });
  }
};

// Get seller details by gem ID (for "Contact Now" button)
const getSellerByGemId = async (req, res) => {
  try {
    const { gemId } = req.params;

    // Find gem and populate seller details
    const gem = await Gem.findById(gemId).populate('sellerId', 'name email profileImage');

    if (!gem) {
      return res.status(404).json({ message: "Gem not found" });
    }

    if (!gem.sellerId) {
      return res.status(404).json({ message: "Seller information not available" });
    }

    // Return seller details
    res.json({
      gemId: gem._id,
      gemName: gem.name,
      seller: {
        _id: gem.sellerId._id,
        name: gem.sellerId.name,
        email: gem.sellerId.email,
        profileImage: gem.sellerId.profileImage
      }
    });
  } catch (error) {
    console.error("GET SELLER ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getGems, getLatestGems, createGem, approveGem, getSellerByGemId };