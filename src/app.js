/**
 * Express application setup
 * Initializes middleware, routes, and error handling
 */

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const gemRoutes = require("./routes/gem.routes");
const toolRoutes = require("./routes/tool.routes");
const chatRoutes = require("./routes/chat.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

// Core middleware for CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ ok: true, message: "GEMORA API running" });
});

// API route registration
app.use("/api/auth", authRoutes);
app.use("/api/gems", gemRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/chat", chatRoutes);

// Global error handling middleware
app.use(errorMiddleware);

module.exports = app;