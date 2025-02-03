const express = require("express");

const {getSubscription,getSubscriptionByID } = require("../controllers/subscriptionController")

const router = express.Router();

// Get all subscriptions
router.get("/", getSubscription);

// Create a new subscription
router.post("/",getSubscriptionByID );

module.exports = router;

