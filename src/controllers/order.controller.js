/**
 * Order controller
 * Handles order creation, retrieval, and status updates
 */

const Order = require("../models/Order");
const Gem = require("../models/gem");
const Tool = require("../models/tool");

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      shippingPrice,
      taxPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      shippingPrice,
      taxPrice,
    });

    const createdOrder = await order.save();

    // Update stock for each item
    for (const item of orderItems) {
      if (item.productType === "Gem") {
        await Gem.findByIdAndUpdate(item.productId, {
          $inc: { countInStock: -item.quantity },
        });
      } else if (item.productType === "Tool" || item.productType === "Instrument") {
        await Tool.findByIdAndUpdate(item.productId, {
          $inc: { countInStock: -item.quantity },
        });
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order or is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged in user's orders (Admins see all orders)
exports.getMyOrders = async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { user: req.user._id };
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${orders.length} orders in database`);
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, orderStatus } = req.body;
    const nextStatus = status ?? orderStatus;

    if (!nextStatus) {
      return res.status(400).json({ message: "Status is required" });
    }

    const allowedStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = nextStatus;

    if (nextStatus === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// Update order payment status
exports.updateOrderPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentStatus = "Paid";

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an order (Admin only)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
