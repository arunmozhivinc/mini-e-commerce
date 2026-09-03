const { createProxyMiddleware } = require('http-proxy-middleware');

const AUTH_SERVICE = `http://localhost:${process.env.AUTH_SERVICE_PORT || 5001}`;
const PRODUCT_SERVICE = `http://localhost:${process.env.PRODUCT_SERVICE_PORT || 5002}`;
const ORDER_SERVICE = `http://localhost:${process.env.ORDER_SERVICE_PORT || 5003}`;
const PAYMENT_SERVICE = `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 5004}`;
const NOTIFICATION_SERVICE = `http://localhost:${process.env.NOTIFICATION_SERVICE_PORT || 5005}`;

const setupProxies = (app) => {
  // Auth Service Proxy
  app.use(
    createProxyMiddleware({
      target: AUTH_SERVICE,
      changeOrigin: true,
      pathFilter: ['/api/auth', '/api/users'],
    })
  );

  // Product Service Proxy
  app.use(
    createProxyMiddleware({
      target: PRODUCT_SERVICE,
      changeOrigin: true,
      pathFilter: ['/api/products', '/api/categories'],
    })
  );

  // Order Service Proxy (Cart & Orders)
  app.use(
    createProxyMiddleware({
      target: ORDER_SERVICE,
      changeOrigin: true,
      pathFilter: ['/api/cart', '/api/orders'],
    })
  );

  // Payment Webhook (Raw body forward)
  app.use(
    '/api/payments/webhook',
    createProxyMiddleware({
      target: `${PAYMENT_SERVICE}/api/payments/webhook`,
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq, req) => {
          if (req.rawBody) {
            proxyReq.setHeader('Content-Length', Buffer.byteLength(req.rawBody));
            proxyReq.write(req.rawBody);
          }
        },
      },
    })
  );

  // Payment Service Proxy (General payment routes)
  app.use(
    createProxyMiddleware({
      target: PAYMENT_SERVICE,
      changeOrigin: true,
      pathFilter: '/api/payments',
    })
  );

  // Notification Service Proxy
  app.use(
    createProxyMiddleware({
      target: NOTIFICATION_SERVICE,
      changeOrigin: true,
      pathFilter: '/api/notifications',
    })
  );
};

module.exports = { setupProxies };
