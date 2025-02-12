const Subscriptionplan = require("../models/subscriptionplan");

exports.getSubscriptionPlan = async (req, res) => {
    try {
        const subscriptionplan = await Subscriptionplan.find();
        res.json(subscriptionplan);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};


exports.getPlanById = async (req, res) => {
    try {
      // Extract the plan ID from the URL parameters
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Plan ID is required." });
      }
  
      // Find the subscription plan by ID
      const plan = await Subscriptionplan.findById(id);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found." });
      }
  
      // Return the found plan
      res.json(plan);
    } catch (error) {
      console.error("Error fetching plan by ID:", error);
      res.status(500).json({ message: "Internal server error." });
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
