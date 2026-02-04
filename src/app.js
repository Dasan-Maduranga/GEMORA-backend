/**
 * Express application setup
 * Initializes middleware, routes, and error handling
 */

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const gemRoutes = require("./routes/gem.routes");
const toolRoutes = require("./routes/tool.routes");
const instrumentRoutes = require("./routes/instrument.routes");
const chatRoutes = require("./routes/chat.routes");
const newsRoutes = require("./routes/news.routes");
const orderRoutes = require("./routes/order.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

// 🔴 THE FIX: Robust CORS Configuration
// This allows both localhost variations and specific headers
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5001",
    "http://127.0.0.1:5001"
  ], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is Connected and Healthy!" });
});

// API route registration
app.use("/api/auth", authRoutes);
app.use("/api/gems", gemRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/instruments", instrumentRoutes);
// Compatibility alias for singular instrument route
app.use("/api/instrument", instrumentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/orders", orderRoutes);

// Global error handling middleware
app.use(errorMiddleware);

module.exports = app;