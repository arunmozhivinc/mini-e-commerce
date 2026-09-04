require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
process.env.SERVICE_NAME = 'notification-worker';

const { Worker } = require('bullmq');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const webpush = require('web-push');
const { connectDB, logger, cacheInvalidate, createRedisClient } = require('shared/src/index');

// Setup Web Push
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

// Schemas needed for worker
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscription: {
      endpoint: { type: String, required: true },
      expirationTime: { type: Number, default: null },
      keys: { p256dh: { type: String, required: true }, auth: { type: String, required: true } },
    },
  },
  { timestamps: true }
);

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);

// Redis connection for BullMQ
const redisConnection = createRedisClient();

const getNotificationContent = (jobData) => {
  const { type, orderNumber, total, status } = jobData;
  switch (type) {
    case 'order_placed':
      return {
        title: '🎉 Order Placed Successfully!',
        message: `Your order #${orderNumber || ''} totaling $${total || '0.00'} has been placed. We're processing it now!`,
      };
    case 'order_confirmed':
      return {
        title: '✅ Order Confirmed',
        message: `Your order #${orderNumber || ''} has been confirmed.`,
      };
    case 'order_processing':
      return {
        title: '📦 Order In Progress',
        message: `Your order #${orderNumber || ''} is currently being packed.`,
      };
    case 'order_shipped':
      return {
        title: '🚚 Order Shipped!',
        message: `Great news! Your order #${orderNumber || ''} is on its way.`,
      };
    case 'order_delivered':
      return {
        title: '📫 Order Delivered!',
        message: `Your order #${orderNumber || ''} has been delivered. Enjoy your purchase!`,
      };
    default:
      return {
        title: 'Order Status Update',
        message: `Status of order #${orderNumber || ''} changed to ${status || 'updated'}.`,
      };
  }
};

const sendPush = async (userId, payload) => {
  if (!publicKey || !privateKey) return;
  try {
    const subscriptions = await Subscription.find({ user: userId });
    for (const subDoc of subscriptions) {
      try {
        await webpush.sendNotification(subDoc.subscription, JSON.stringify(payload));
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await Subscription.deleteOne({ _id: subDoc._id });
        }
      }
    }
  } catch (err) {
    logger.error(`Failed to send web push: ${err.message}`);
  }
};

const startWorker = async () => {
  await connectDB();

  const worker = new Worker(
    'order-notifications',
    async (job) => {
      logger.info(`Processing notification job [${job.id}] of type ${job.data.type}`);
      const { userId, orderId, type } = job.data;
      if (!userId) {
        throw new Error('User ID missing in job data');
      }

      const content = getNotificationContent(job.data);

      // 1. Create Notification record
      const notification = await Notification.create({
        user: userId,
        title: content.title,
        message: content.message,
        type: type || 'order_placed',
        orderId: orderId || null,
        read: false,
      });

      // 2. Invalidate Redis unread count cache
      await cacheInvalidate(`notifications:unread:${userId}`);

      // 3. Send Web Push
      await sendPush(userId, {
        title: content.title,
        body: content.message,
        url: orderId ? `/orders/${orderId}` : '/orders',
        id: notification._id,
      });

      return { notificationId: notification._id };
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job, returnvalue) => {
    logger.info(`Job [${job.id}] completed successfully: ${JSON.stringify(returnvalue)}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job [${job.id}] failed on attempt ${job.attemptsMade}/${job.opts.attempts}: ${err.message}`);
  });

  worker.on('error', (err) => {
    logger.error(`Notification Worker internal error: ${err.message}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down Notification Worker gracefully...');
    await worker.close();
    await redisConnection.quit();
    await mongoose.connection.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  logger.info('BullMQ Notification Worker is actively listening for jobs...');
};

startWorker();
