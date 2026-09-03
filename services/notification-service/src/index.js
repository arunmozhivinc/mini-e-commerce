require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
process.env.SERVICE_NAME = 'notification-service';

const express = require('express');
const cors = require('cors');
const { connectDB, logger } = require('shared/src/index');
const notificationRoutes = require('./routes/notifications');
const { setupWebPush } = require('./push/webpush');

const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 5005;

app.use(cors());
app.use(express.json());

// Initialize Web Push VAPID
setupWebPush();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

app.use('/api/notifications', notificationRoutes);

app.use((err, req, res, next) => {
  logger.error('Unhandled error in Notification Service:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.isOperational ? err.message : 'Internal server error',
  });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Notification Service running on port ${PORT}`);
  });
};

start();
module.exports = app;
