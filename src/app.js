const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// ✅ HEALTH CHECK ROUTE (මෙතන දාන්න)
app.get("/", (req, res) => {
  res.json({ ok: true, message: "GEMORA API running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// error handler
app.use(errorMiddleware);

module.exports = app;
