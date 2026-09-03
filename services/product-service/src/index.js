require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
process.env.SERVICE_NAME = 'product-service';

const express = require('express');
const cors = require('cors');
const { connectDB, logger } = require('shared/src/index');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PRODUCT_SERVICE_PORT || 5002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-service' });
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

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
    logger.info(`Product Service running on port ${PORT}`);
  });
};

start();
module.exports = app;
