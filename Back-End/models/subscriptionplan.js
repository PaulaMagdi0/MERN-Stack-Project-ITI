const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionPlanSchema = new Schema({
    Plan_name: {
        type: String,
        required: true
    },
    Duration: {
        type: Number,
        required: true
    },
    Price: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
