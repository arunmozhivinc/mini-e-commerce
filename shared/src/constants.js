const UserRole = Object.freeze({
  CUSTOMER: 'customer',
  ADMIN: 'admin',
});

const OrderStatus = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

const PaymentStatus = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

const NotificationType = Object.freeze({
  ORDER_PLACED: 'order_placed',
  PAYMENT_SUCCESS: 'payment_success',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
});

module.exports = {
  UserRole,
  OrderStatus,
  PaymentStatus,
  NotificationType,
};
