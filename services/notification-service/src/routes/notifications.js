const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribe,
  getPublicKey,
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// Public route to get VAPID public key
router.get('/public-key', getPublicKey);

// Protected routes
router.use(authenticate);
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.post('/subscribe', subscribe);

module.exports = router;
