const webpush = require('web-push');
const Subscription = require('../models/Subscription');
const { logger } = require('shared/src/index');

const setupWebPush = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

  if (publicKey && privateKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    logger.info('Web Push VAPID details configured');
  } else {
    logger.warn('Web Push VAPID keys not configured in environment variables');
  }
};

const sendPushToUser = async (userId, payload) => {
  try {
    const subscriptions = await Subscription.find({ user: userId });
    if (!subscriptions || subscriptions.length === 0) {
      logger.debug(`No push subscriptions found for user: ${userId}`);
      return;
    }

    const payloadString = JSON.stringify(payload);

    const sendPromises = subscriptions.map(async (subDoc) => {
      try {
        await webpush.sendNotification(subDoc.subscription, payloadString);
        logger.info(`Web push successfully sent to user ${userId}`);
      } catch (err) {
        logger.error(`Error sending push to endpoint: ${err.message}`);
        // 404 or 410 means subscription expired / unsubscribed
        if (err.statusCode === 404 || err.statusCode === 410) {
          await Subscription.deleteOne({ _id: subDoc._id });
          logger.info(`Expired push subscription removed: ${subDoc._id}`);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (error) {
    logger.error(`sendPushToUser error: ${error.message}`);
  }
};

module.exports = { setupWebPush, sendPushToUser };
