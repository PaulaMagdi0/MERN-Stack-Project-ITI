// /routes/paymentRoutes.js
const express = require('express');
const { createPaymentIntent } = require('../controllers/paymentController');
const router = express.Router();

// POST /api/payments/create-payment-intent
router.post('/create-payment-intent', createPaymentIntent);

module.exports = router;
