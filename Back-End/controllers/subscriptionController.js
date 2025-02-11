
const Subscription = require("../models/subscription");
const SubscriptionPlan = require("../models/subscriptionplan");

exports.getSubscription = async (req, res) => {
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
exports.updateSubscription = async (req, res) => {
    try {
        const { userId, planId } = req.body;

        if (!userId || !planId) {
            return res.status(400).json({ error: "userId and planId are required." });
        }

        // Find existing subscription
        let subscription = await Subscription.findOne({ userId });
        if (!subscription) {
            return res.status(404).json({ error: "Subscription not found." });
        }

        // Update the subscription
        subscription.planId = planId;
        subscription.subscriptionDate = new Date();
        subscription.renewalDate = new Date();
        subscription.renewalDate.setMonth(subscription.renewalDate.getMonth() + 1);

        await subscription.save();
        res.status(200).json({ message: "Subscription updated successfully", subscription });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
