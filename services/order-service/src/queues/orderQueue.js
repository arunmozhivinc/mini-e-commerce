const { Queue } = require('bullmq');
const { createRedisClient } = require('shared/src/index');

const connection = createRedisClient();

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
