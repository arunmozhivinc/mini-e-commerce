const Notification = require('../models/Notification');
const Subscription = require('../models/Subscription');
const { cacheGet, cacheInvalidate, getRedisClient, logger } = require('shared/src/index');
const { sendPushToUser } = require('../push/webpush');

const UNREAD_CACHE_TTL = 300; // 5 minutes

const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const total = await Notification.countDocuments({ user: req.user.id });
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Get notifications error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const cacheKey = `notifications:unread:${req.user.id}`;
    const count = await cacheGet(cacheKey, UNREAD_CACHE_TTL, async () => {
      return Notification.countDocuments({ user: req.user.id, read: false });
    });

    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    logger.error('Get unread count error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Invalidate unread count cache in Redis
    await cacheInvalidate(`notifications:unread:${req.user.id}`);

    res.json({ success: true, data: { notification } });
  } catch (error) {
    logger.error('Mark as read error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );

    // Invalidate unread count cache in Redis
    await cacheInvalidate(`notifications:unread:${req.user.id}`);

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Mark all as read error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};

const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ success: false, message: 'Valid subscription object is required' });
    }

    await Subscription.findOneAndUpdate(
      { user: req.user.id, 'subscription.endpoint': subscription.endpoint },
      { user: req.user.id, subscription },
      { upsert: true, new: true }
    );

    logger.info(`Web push subscription saved for user ${req.user.id}`);
    res.json({ success: true, message: 'Subscribed to push notifications successfully' });
  } catch (error) {
    logger.error('Subscribe push error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to save subscription' });
  }
};

const getPublicKey = (req, res) => {
  res.json({
    success: true,
    data: {
      publicKey: process.env.VAPID_PUBLIC_KEY || '',
    },
  });
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribe,
  getPublicKey,
};
