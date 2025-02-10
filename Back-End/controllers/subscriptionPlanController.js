const Subscriptionplan = require("../models/subscriptionplan");

exports.getSubscriptionPlan = async (req, res) => {
    try {
        const subscriptionplan = await Subscriptionplan.find();
        res.json(subscriptionplan);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

exports.getSubscriptionPlanByID = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const subscriptionplan = await Subscriptionplan.findById(id);

        if (!subscriptionplan) return res.status(404).json({ message: "User not found" });

        res.json(subscriptionplan);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
};
