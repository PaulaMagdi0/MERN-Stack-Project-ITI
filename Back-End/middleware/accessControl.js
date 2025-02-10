const User = require("../models/User");

const checkPdfAccess = async (req, res, next) => {
    try {
        const userId = req.user._id; // Assuming user ID is stored in req.user
        const user = await User.findById(userId).populate("subscription.plan");

        if (!user) return res.status(401).json({ message: "Unauthorized access" });

        const subscription = user.subscription;
        const isDefaultPlan = subscription.plan.Plan_name.toLowerCase() === "default";
        const isExpired = new Date(subscription.renewalDate) < new Date();

        if (isExpired) {
            return res.status(403).json({ message: "Subscription expired. Please renew." });
        }

        req.limitPages = isDefaultPlan ? 5 : null; // Allow only 5 pages for default users
        next();
    } catch (error) {
        console.error("Access Control Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = checkPdfAccess;
