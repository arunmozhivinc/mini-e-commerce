const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { addOrderNotificationJob } = require('../queues/orderQueue');
const { logger, OrderStatus } = require('shared/src/index');

const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 ||
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode ||
        !shippingAddress.phone) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
    const shippingCost = subtotal >= 50 ? 0 : 5.99; // Free shipping over $50
    const total = Math.round((subtotal + tax + shippingCost) * 100) / 100;

    const orderNumber = Order.generateOrderNumber();

    const order = await Order.create({
      user: req.user.id,
      orderNumber,
      items: cart.items.map((item) => ({
        product: item.product,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      })),
      shippingAddress,
      subtotal,
      tax,
      shippingCost,
      total,
    });

    // Clear cart after order creation
    cart.items = [];
    await cart.save();

    // Queue order notification
    try {
      await addOrderNotificationJob({
        type: 'order_placed',
        orderId: order._id.toString(),
        userId: req.user.id,
        orderNumber: order.orderNumber,
        total: order.total,
      });
      logger.info(`Order notification queued: ${orderNumber}`);
    } catch (queueError) {
      logger.error('Failed to queue order notification:', queueError.message);
      // Don't fail the order creation if notification queue fails
    }

    logger.info(`Order created: ${orderNumber} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order },
    });
  } catch (error) {
    logger.error('Create order error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const total = await Order.countDocuments({ user: req.user.id });
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: {
        orders,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    logger.error('Get orders error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id }).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: { order } });
  } catch (error) {
    logger.error('Get order error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const query = {};
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: {
        orders,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    logger.error('Get all orders error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = Object.values(OrderStatus);

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Queue status update notification
    try {
      await addOrderNotificationJob({
        type: `order_${status}`,
        orderId: order._id.toString(),
        userId: order.user.toString(),
        orderNumber: order.orderNumber,
        status,
      });
    } catch (queueError) {
      logger.error('Failed to queue status notification:', queueError.message);
    }

    logger.info(`Order ${order.orderNumber} status updated to ${status}`);
    res.json({ success: true, data: { order } });
  } catch (error) {
    logger.error('Update order status error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

module.exports = { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus };
