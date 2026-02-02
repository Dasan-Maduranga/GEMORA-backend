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

// 🔴 THE FIX: Robust CORS Configuration
// This allows both localhost variations and specific headers
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// 2. Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is Connected and Healthy!" });
});

// API route registration
app.use("/api/auth", authRoutes);
app.use("/api/gems", gemRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/chat", chatRoutes);

// Global error handling middleware
app.use(errorMiddleware);

module.exports = app;