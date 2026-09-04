require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
process.env.SERVICE_NAME = 'api-gateway';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { logger } = require('shared/src/index');
const { setupProxies } = require('./config/proxy');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || process.env.API_GATEWAY_PORT || 5000;

// CORS — allow frontend origin & Vercel deployments
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const frontendUrl = process.env.FRONTEND_URL;
      if (
        !frontendUrl ||
        origin === frontendUrl ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for demo
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging
app.use(morgan('short'));

// Raw body capture for webhook endpoints (must come before json parser)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
});

// Rate limiting
app.use('/api/auth', authLimiter);
app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  });
});

// Setup proxy routes to microservices
setupProxies(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Gateway error:', err.message);
  res.status(500).json({ success: false, message: 'Internal gateway error' });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

module.exports = app;
