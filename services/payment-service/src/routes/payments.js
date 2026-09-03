const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleWebhook, getPaymentByOrderId } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// Webhook — no auth, raw body (handled by gateway/express.raw)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.post('/create', authenticate, createCheckoutSession);
router.get('/:orderId', authenticate, getPaymentByOrderId);

module.exports = router;
