/**
 * Tool controller
 * Handles gemological tool operations (retrieve and create)
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

module.exports = { getTools, createTool };