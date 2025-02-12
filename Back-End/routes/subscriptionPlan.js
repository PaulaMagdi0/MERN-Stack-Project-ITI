const express = require("express");

const {getSubscriptionPlan,getSubscriptionPlanByID,getPlanById } = require("../controllers/subscriptionPlanController.js")
const router = express.Router();


// Get all subscriptions
router.get("/", getSubscriptionPlan);

router.get("/:id", getPlanById);


// Create a new subscription
router.post("/",getSubscriptionPlanByID );

module.exports = router;
