const NewsPost = require('../models/newsPost');

// Get All News
exports.getAllNews = async (req, res) => {
  try {
    const news = await NewsPost.find().sort({ createdAt: -1 }); // Newest first
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create News
exports.createNews = async (req, res) => {
  try {
    const { title, excerpt, content, author, status, imageUrl, tags } = req.body;
    const newPost = new NewsPost({
      title, excerpt, content, author, status, imageUrl, tags
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete News
exports.deleteNews = async (req, res) => {
  try {
    await NewsPost.findByIdAndDelete(req.params.id);
    res.json({ message: "News post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Status (Publish/Draft/Archive)
exports.updateNewsStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedPost = await NewsPost.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};