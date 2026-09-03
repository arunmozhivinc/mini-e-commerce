require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
process.env.SERVICE_NAME = 'auth-service';

const express = require('express');
const cors = require('cors');
const { connectDB, logger } = require('shared/src/index');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.isOperational ? err.message : 'Internal server error',
  });
});

// Start server
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Auth Service running on port ${PORT}`);
  });
};

start();

module.exports = app;
