const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscription: {
      endpoint: { type: String, required: true },
      expirationTime: { type: Number, default: null },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

// One endpoint per user or compound index
subscriptionSchema.index({ user: 1, 'subscription.endpoint': 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
