/**
 * Database connection configuration
 * Connects to MongoDB Atlas using environment variables
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Establish MongoDB connection
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    // Log error and exit process if connection fails
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
