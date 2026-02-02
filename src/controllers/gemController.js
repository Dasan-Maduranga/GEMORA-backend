/**
 * Gem controller
 * Handles gem product operations (retrieve and create)
 */

const Gem = require('../models/gem');

// Retrieve all gems from database
const getGems = async (req, res) => {
  try {
    const gems = await Gem.find({});
    res.json(gems);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Create and save a new gem product
const createGem = async (req, res) => {
  const { name, carat, clarity, origin, price, countInStock, imageUrl, description } = req.body;

  try {
    const gem = new Gem({
      name, carat, clarity, origin, price, countInStock, imageUrl, description
    });

    const createdGem = await gem.save();
    res.status(201).json(createdGem);
  } catch (error) {
    res.status(400).json({ message: "Invalid data", error: error.message });
  }
};

module.exports = { getGems, createGem };