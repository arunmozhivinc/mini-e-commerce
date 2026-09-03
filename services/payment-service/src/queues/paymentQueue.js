const { Queue } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  maxRetriesPerRequest: null,
});

const paymentConfirmationQueue = new Queue('payment-confirmations', { connection });

const addPaymentConfirmationJob = async (data) => {
  return paymentConfirmationQueue.add('payment-confirmation', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    delay: 5000, // 5 second delay for payment confirmation
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  });
};

module.exports = { paymentConfirmationQueue, addPaymentConfirmationJob };
