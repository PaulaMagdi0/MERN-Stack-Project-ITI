const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: String, // Active, Canceled
    plan: String, // Basic, Premium
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
