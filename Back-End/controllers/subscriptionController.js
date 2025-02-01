
const Subscription = require("../models/subscription");
const SubscriptionPlan = require("../models/subscriptionplan");

exports.getSubscription= async (req, res) => {
    try {
        const subscriptions = await Subscription.find().populate("planId userId");
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getSubscriptionByID = async (req, res) => {
    try {
        const { userId, planId } = req.body;

        if (!userId || !planId) {
            return res.status(400).json({ error: "userId and planId are required." });
        }

        // Check if the subscription plan exists
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({ error: "Subscription plan not found." });
        }

        // Create subscription
        const subscription = new Subscription({ userId, planId });
        await subscription.save();

        res.status(201).json(subscription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}