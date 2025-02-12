const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { handleStripeWebhook } = require('../utils/PaymentHook');
const { createPaymentIntent } = require('../controllers/paymentController');

// Use raw body parser for Stripe webhook endpoint
// Webhook route should handle raw body data for Stripe signature verification
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);

// Route for creating a payment intent
router.post('/create-payment-intent', createPaymentIntent);

module.exports = router;
