const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../utils/PaymentHook');

// Use express.raw() for Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
