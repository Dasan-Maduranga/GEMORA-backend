/**
 * Tool model
 * Defines schema for gemological tools and instruments with inventory tracking
 */

const mongoose = require("mongoose");

const toolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true, default: 0 },
    description: { type: String },
    imageUrl: { type: String }, // Backward compatibility
    images: [{ type: String }], // 👈 Array of image URLs
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tool", toolSchema);