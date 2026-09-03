const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Customer routes
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/admin/all', authorize('admin'), getAllOrders);
router.get('/:id', getOrderById);

// Admin routes
router.patch('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;
