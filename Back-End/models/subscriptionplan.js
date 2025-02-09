const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubscriptionPlanSchema = new Schema({
    planName: {
        type: String,
        required: true,
        unique: true, // Plan names should be unique (e.g., "Default", "Premium")
    },
    duration: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    pageLimit: {
        type: Number,
        default: null, // Null means unlimited pages
    },
}, { timestamps: true });

module.exports = mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
