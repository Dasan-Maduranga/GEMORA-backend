/**
 * Order routes
 * Defines endpoints for order creation and management
 */

const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderPayment,
} = require("../controllers/order.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorization.middleware");

// User routes - requires authentication
router.post("/", verifyToken, createOrder);
router.get("/myorders", verifyToken, getMyOrders);
router.get("/:id", verifyToken, getOrderById);
router.put("/:id/pay", verifyToken, updateOrderPayment);

// Admin routes
router.get("/", verifyToken, authorize(["admin"]), getAllOrders);
router.put("/:id/status", verifyToken, authorize(["admin"]), updateOrderStatus);

module.exports = router;
