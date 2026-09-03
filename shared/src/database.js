const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async (uri) => {
  try {
    const dbUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-ecommerce';
    await mongoose.connect(dbUri);
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err.message);
});

module.exports = connectDB;
