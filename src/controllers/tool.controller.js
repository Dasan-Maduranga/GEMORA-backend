/**
 * Tool controller
 * Handles gemological tool operations (retrieve, create, and status update)
 */

const Tool = require('../models/tool');

// Retrieve all tools from database
const getTools = async (req, res) => {
  try {
    const tools = await Tool.find({});
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Create and save a new tool product
const createTool = async (req, res) => {
  const { name, brand, category, price, countInStock, description, imageUrl } = req.body;

  try {
    const tool = new Tool({
      name, brand, category, price, countInStock, description, imageUrl
    });

    const createdTool = await tool.save();
    res.status(201).json(createdTool);
  } catch (error) {
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

module.exports = { getTools, createTool, updateToolStatus };