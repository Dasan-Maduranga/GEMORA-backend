/**
 * Server entry point
 * Loads environment variables, connects to database, and starts the Express server
 */

require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Initialize database connection
connectDB();

// Start HTTP server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
