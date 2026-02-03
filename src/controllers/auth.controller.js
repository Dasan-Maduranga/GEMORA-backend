/**
 * Authentication controller
 * Handles user registration and login with JWT tokens
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
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
        folder: "gemora-profiles",
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

// Generate JWT token for authenticated user
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Register new user with email and password
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    // Hash password and create user
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    // Generate token and return user data
    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// Authenticate user and issue JWT token
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Verify password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // Generate token and return user data
    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    // Fetching the latest data directly from the DB
    const user = await User.findById(req.user._id).select("-password");
    res.json({ user }); // This sends the user data back to React
  } catch (err) {
    next(err);
  }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    // Validate role
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
    }

    // Update user role
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// List all users (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// Get specific user by ID (Admin or self)
exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// Update user profile (name, email)
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    
    // 1. Find the user using the ID attached by the verifyToken middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Apply the new values
    user.name = name || user.name;
    user.email = email || user.email;

    // 3. CRITICAL: You must await the save() call
    const updatedUser = await user.save();

    // 4. Return the updated data (exclude password)
    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};
// Upload profile image
exports.uploadProfileImage = async (req, res, next) => {
  try {
    console.log("🔍 [uploadProfileImage] User:", req.user._id);
    console.log("🔍 [uploadProfileImage] File uploaded:", req.file ? "yes" : "no");

    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    console.log("📸 [uploadProfileImage] Uploading profile image to Cloudinary...");

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    console.log("✅ [uploadProfileImage] Image uploaded:", imageUrl);

    // Update user with profile image
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    ).select("-password");

    console.log("✅ [uploadProfileImage] Profile image updated for user:", req.user._id);

    res.json({
      message: "Profile image uploaded successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (error) {
    console.error("❌ [uploadProfileImage] ERROR:", error);
    res.status(400).json({
      message: "Failed to upload profile image",
      error: error.message
    });
  }
};