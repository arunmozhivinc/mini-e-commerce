require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
process.env.SERVICE_NAME = 'payment-worker';

const { Worker } = require('bullmq');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const webpush = require('web-push');
const { connectDB, logger, cacheInvalidate } = require('shared/src/index');

// Setup Web Push
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

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

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  maxRetriesPerRequest: null,
});

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
    'payment-confirmations',
    async (job) => {
      logger.info(`Processing payment confirmation job [${job.id}] for order ${job.data.orderId}`);
      const { userId, orderId, amount, orderNumber } = job.data;

      if (!userId) {
        throw new Error('Missing userId in payment job data');
      }

      const title = '💳 Payment Confirmed!';
      const message = `We've successfully verified your payment of $${amount?.toFixed ? amount.toFixed(2) : amount} for order #${orderNumber || orderId}. Your order is now confirmed!`;

      // 1. Create notification
      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type: 'payment_success',
        orderId: orderId || null,
        read: false,
      });

      // 2. Invalidate user's unread notifications cache
      await cacheInvalidate(`notifications:unread:${userId}`);

      // 3. Send Web Push
      await sendPush(userId, {
        title,
        body: message,
        url: orderId ? `/orders/${orderId}` : '/orders',
        id: notification._id,
      });

      logger.info(`Payment confirmation processed and notified for order ${orderId}`);
      return { status: 'confirmed', notificationId: notification._id };
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job, returnvalue) => {
    logger.info(`Payment confirmation job [${job.id}] finished successfully.`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Payment job [${job.id}] failed attempt ${job.attemptsMade}/${job.opts.attempts}: ${err.message}`);
  });

  worker.on('error', (err) => {
    logger.error(`Payment Worker error: ${err.message}`);
  });

  const shutdown = async () => {
    logger.info('Shutting down Payment Worker gracefully...');
    await worker.close();
    await redisConnection.quit();
    await mongoose.connection.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  logger.info('BullMQ Payment Worker is actively listening for delayed confirmations...');
};

startWorker();
