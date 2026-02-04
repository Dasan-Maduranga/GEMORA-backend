/**
 * Gem model
 * Defines schema for gemstone products with admin approval
 */

const mongoose = require("mongoose");

const gemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    carat: { type: Number, required: true },
    clarity: { type: String },
    origin: { type: String },
    phoneNumber : {type : String , required: true},
    countInStock: { type: Number, required: true, default: 1 },
    images: [{ type: String }], // 👈 Array of image URLs
    description: { type: String },
    isApproved: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // 👈 Reference to seller (User) - optional for existing gems
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gem", gemSchema);