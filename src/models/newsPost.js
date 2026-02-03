const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true }, // Short summary
  content: { type: String, required: true },
  author: { type: String, default: "Admin" },
  status: { 
    type: String, 
    enum: ['Published', 'Draft', 'Archived'], 
    default: 'Published' 
  },
  imageUrl: { type: String }, // We will store the URL or Base64 string
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NewsPost', newsSchema);