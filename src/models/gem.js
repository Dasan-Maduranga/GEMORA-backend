/**
 * Gem model
 * Defines schema for gemstone products with properties and inventory
 */

const mongoose = require("mongoose");

const gemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    carat: { type: Number, required: true },
    clarity: { type: String },
    origin: { type: String },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true, default: 1 },
    imageUrl: { type: String },
    description: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gem", gemSchema);