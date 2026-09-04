module.exports = {
  apps: [
    {
      name: 'auth-service',
      script: 'services/auth-service/src/index.js',
      env: {
        SERVICE_NAME: 'auth-service',
        AUTH_SERVICE_PORT: 5001,
      },
    },
    {
      name: 'product-service',
      script: 'services/product-service/src/index.js',
      env: {
        SERVICE_NAME: 'product-service',
        PRODUCT_SERVICE_PORT: 5002,
      },
    },
    {
      name: 'order-service',
      script: 'services/order-service/src/index.js',
      env: {
        SERVICE_NAME: 'order-service',
        ORDER_SERVICE_PORT: 5003,
      },
    },
    {
      name: 'payment-service',
      script: 'services/payment-service/src/index.js',
      env: {
        SERVICE_NAME: 'payment-service',
        PAYMENT_SERVICE_PORT: 5004,
      },
    },
    {
      name: 'notification-service',
      script: 'services/notification-service/src/index.js',
      env: {
        SERVICE_NAME: 'notification-service',
        NOTIFICATION_SERVICE_PORT: 5005,
      },
    },
    {
      name: 'payment-worker',
      script: 'workers/payment-worker/src/index.js',
      env: {
        SERVICE_NAME: 'payment-worker',
      },
    },
    {
      name: 'notification-worker',
      script: 'workers/notification-worker/src/index.js',
      env: {
        SERVICE_NAME: 'notification-worker',
      },
    },
    {
      name: 'api-gateway',
      script: 'services/api-gateway/src/index.js',
      env: {
        SERVICE_NAME: 'api-gateway',
      },
    },
  ],
};
