/**
 * Tool controller
 * Handles gemological tool operations (retrieve, create, and status update)
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
        folder: "gemora-tools",
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

// Retrieve all tools from database
const getTools = async (req, res) => {
  try {
    // If admin is logged in, show all. Otherwise, only show approved tools.
    const query = req.user && req.user.role === 'admin' ? {} : { status: 'Approved' };
    
    const tools = await Tool.find(query);
    
    // 🔹 Ensure images array always exists
    const sanitizedTools = tools.map(tool => {
      const t = tool.toObject();
      if (!t.images) t.images = t.imageUrl ? [t.imageUrl] : [];
      return t;
    });
    
    res.json(sanitizedTools);
  } catch (error) {
    console.error("GET TOOLS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create and save a new tool product
const createTool = async (req, res) => {
  try {
    console.log("🔍 [createTool] Request body:", JSON.stringify(req.body, null, 2));
    console.log("🔍 [createTool] Files uploaded:", req.files ? req.files.length : 0);

    const { name, brand, category, price, countInStock, description } = req.body;

    // Check authentication
    if (!req.user) {
      console.warn("⚠️ [createTool] No user - not authenticated");
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!req.files || req.files.length === 0) {
      console.warn("⚠️ [createTool] No images provided");
      return res.status(400).json({ message: "At least one image is required" });
    }

    // Validate required fields
    if (!name || !brand || !category || !price) {
      console.warn("⚠️ [createTool] Missing required fields");
      return res.status(400).json({ message: "Name, brand, category, and price are required" });
    }

    console.log("📸 [createTool] Uploading", req.files.length, "images to Cloudinary...");

    // 🔹 Upload all files to Cloudinary
    const imageUrls = [];
    for (const file of req.files) {
      try {
        const url = await uploadToCloudinary(file.buffer, file.originalname);
        imageUrls.push(url);
        console.log("✅ [createTool] Image uploaded:", url);
      } catch (uploadError) {
        console.error("❌ [createTool] Cloudinary upload failed:", uploadError);
        return res.status(400).json({ 
          message: "Failed to upload image to Cloudinary", 
          error: uploadError.message 
        });
      }
    }

    const tool = new Tool({
      name, 
      brand, 
      category, 
      price, 
      countInStock, 
      description, 
      images: imageUrls
    });

    const createdTool = await tool.save();
    console.log("✅ [createTool] Tool created successfully:", createdTool._id);
    res.status(201).json(createdTool);
  } catch (error) {
    console.error("❌ [createTool] ERROR:", error);
    res.status(400).json({ message: "Invalid data", error: error.message });
  }
};

// Update the status of a specific tool
const updateToolStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const tool = await Tool.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true } // Return the updated document
    );
    if (!tool) return res.status(404).json({ message: "Tool not found" });
    res.json(tool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk approve all pending tools (Admin only)
const bulkApproveTools = async (req, res) => {
  try {
    const result = await Tool.updateMany(
      { status: 'Pending' },
      { status: 'Approved' }
    );
    
    res.json({ 
      message: `Successfully approved ${result.modifiedCount} tools`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("BULK APPROVE TOOLS ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getTools, createTool, updateToolStatus, bulkApproveTools };