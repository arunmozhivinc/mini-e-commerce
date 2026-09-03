const { Queue } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  maxRetriesPerRequest: null,
});

const orderNotificationQueue = new Queue('order-notifications', { connection });

const addOrderNotificationJob = async (data) => {
  return orderNotificationQueue.add('order-notification', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  });
};

module.exports = { orderNotificationQueue, addOrderNotificationJob };
