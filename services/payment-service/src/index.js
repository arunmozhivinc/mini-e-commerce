require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
process.env.SERVICE_NAME = 'payment-service';

const express = require('express');
const cors = require('cors');
const { connectDB, logger } = require('shared/src/index');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || 5004;

app.use(cors());

// JSON parsing for all routes except webhook
app.use((req, res, next) => {
  if (req.path === '/api/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-service' });
});

app.use('/api/payments', paymentRoutes);

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.isOperational ? err.message : 'Internal server error',
  });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Payment Service running on port ${PORT}`);
  });
};

start();
module.exports = app;
