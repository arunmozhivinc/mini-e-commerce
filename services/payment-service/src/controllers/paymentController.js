const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = require('stripe')(stripeKey);
const Payment = require('../models/Payment');
const { addPaymentConfirmationJob } = require('../queues/paymentQueue');
const { logger, PaymentStatus } = require('shared/src/index');
const mongoose = require('mongoose');
const path = require('path');

const Order = mongoose.models.Order || require(path.resolve(__dirname, '../../../order-service/src/models/Order'));

/**
 * POST /api/payments/create
 * Create a Stripe Checkout Session with sandbox fallback
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    // Find the order
    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    const isPlaceholderKey =
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY.includes('placeholder') ||
      process.env.STRIPE_SECRET_KEY.includes('your_stripe');

    let sessionId = null;
    let sessionUrl = null;

    if (!isPlaceholderKey) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          client_reference_id: orderId,
          customer_email: req.user.email,
          line_items: order.items.map((item) => ({
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name,
                images: item.image ? [item.image] : [],
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          })),
          metadata: {
            orderId: orderId,
            userId: req.user.id,
            orderNumber: order.orderNumber,
          },
          success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
          cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel?order_id=${orderId}`,
        });

        sessionId = session.id;
        sessionUrl = session.url;
      } catch (stripeErr) {
        logger.warn(`Stripe live session creation failed (${stripeErr.message}). Falling back to Sandbox Mode.`);
      }
    }

    // Sandbox Fallback
    const isSandbox = !sessionUrl;
    if (isSandbox) {
      sessionId = `sim_cs_${Date.now()}`;
      sessionUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id=${sessionId}&order_id=${orderId}`;
      logger.info(`Operating in Sandbox Payment Mode for order #${order.orderNumber}`);
    }

    // Record Payment in database
    const payment = await Payment.create({
      order: orderId,
      user: req.user.id,
      stripeSessionId: sessionId,
      amount: order.total,
      currency: 'usd',
      status: PaymentStatus.PENDING,
    });

    order.paymentId = payment._id;
    await order.save();

    // If sandbox mode, simulate instant confirmation and webhook processing
    if (isSandbox) {
      setTimeout(async () => {
        try {
          await Payment.findByIdAndUpdate(payment._id, {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
          });

          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: PaymentStatus.COMPLETED,
            status: 'confirmed',
          });

          await addPaymentConfirmationJob({
            paymentId: payment._id.toString(),
            orderId,
            userId: req.user.id,
            amount: order.total,
            orderNumber: order.orderNumber,
          });

          logger.info(`Sandbox payment settled & BullMQ confirmation queued for #${order.orderNumber}`);
        } catch (simErr) {
          logger.error(`Sandbox payment settlement error: ${simErr.message}`);
        }
      }, 500);
    }

    res.json({
      success: true,
      data: {
        sessionId,
        url: sessionUrl,
        isSandbox,
      },
    });
  } catch (error) {
    logger.error(`Create checkout session error: ${error.message}`, error.stack);
    res.status(500).json({ success: false, message: error.message || 'Failed to create payment session' });
  }
};

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events — verifies signature
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      logger.warn('Webhook signature verification skipped (no webhook secret configured)');
    }
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId || session.client_reference_id;
        const userId = session.metadata?.userId;

        logger.info(`Payment completed for order: ${orderId}`);

        const payment = await Payment.findOneAndUpdate(
          { stripeSessionId: session.id },
          {
            status: PaymentStatus.COMPLETED,
            stripePaymentIntentId: session.payment_intent,
            paidAt: new Date(),
          },
          { new: true }
        );

        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: PaymentStatus.COMPLETED,
            status: 'confirmed',
          });
        }

        if (payment && userId) {
          try {
            await addPaymentConfirmationJob({
              paymentId: payment._id.toString(),
              orderId,
              userId,
              amount: payment.amount,
              orderNumber: session.metadata?.orderNumber,
            });
            logger.info(`Payment confirmation job queued for order ${orderId}`);
          } catch (queueError) {
            logger.error(`Failed to queue payment confirmation: ${queueError.message}`);
          }
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        await Payment.findOneAndUpdate(
          { stripeSessionId: session.id },
          { status: PaymentStatus.FAILED }
        );
        logger.info(`Payment session expired: ${session.id}`);
        break;
      }

      default:
        logger.debug(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    logger.error(`Webhook processing error: ${error.message}`);
  }

  res.status(200).json({ received: true });
};

/**
 * GET /api/payments/:orderId
 * Get payment status for an order
 */
const getPaymentByOrderId = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      order: req.params.orderId,
      user: req.user.id,
    }).lean();

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, data: { payment } });
  } catch (error) {
    logger.error(`Get payment error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch payment' });
  }
};

module.exports = { createCheckoutSession, handleWebhook, getPaymentByOrderId };
