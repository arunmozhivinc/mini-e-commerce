require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
process.env.SERVICE_NAME = 'order-service';

const express = require('express');
const cors = require('cors');
const { connectDB, logger } = require('shared/src/index');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.ORDER_SERVICE_PORT || 5003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

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
    logger.info(`Order Service running on port ${PORT}`);
  });
};

start();
module.exports = app;
