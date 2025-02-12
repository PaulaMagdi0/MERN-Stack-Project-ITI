const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubscriptionPlanSchema = new Schema({
    Plan_name: {
        type: String,
        required: true,
        unique: true, // Plan names should be unique (e.g., "Default", "Premium")
    },
    Duration: {
        type: Number,
        required: true,
    },
    Price: {
        type: Number,
        required: true,
    },

}, { timestamps: true });

module.exports = mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
