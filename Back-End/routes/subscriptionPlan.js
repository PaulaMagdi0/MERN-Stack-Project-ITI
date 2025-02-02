const express = require("express");

const {getSubscriptionPlan,getSubscriptionPlanByID } = require("../controllers/subscriptionPlanController.js")

const router = express.Router();

// Get all subscriptions
router.get("/", getSubscriptionPlan);

// Create a new subscription
router.post("/",getSubscriptionPlanByID );

module.exports = router;
