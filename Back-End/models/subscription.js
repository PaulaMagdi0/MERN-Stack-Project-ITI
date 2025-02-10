const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SubscriptionPlan = require("./subscriptionplan"); 

const SubscriptionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        planId: {
            type: Schema.Types.ObjectId,
            ref: "SubscriptionPlan",
            required: true,
        },
        subscriptionDate: {
            type: Date,
            default: Date.now,
        },
        renewalDate: {
            type: Date,
        },
    },
    { timestamps: false } 
);

// Automatically calculate the renewal date based on the plan duration
SubscriptionSchema.pre("save", async function (next) {
    if (!this.isModified("planId")) return next(); 

    try {
        const plan = await SubscriptionPlan.findById(this.planId);
        if (plan) {
            const subscriptionDate = new Date(this.subscriptionDate);
            subscriptionDate.setMonth(subscriptionDate.getMonth() + plan.Duration);
            this.renewalDate = subscriptionDate;
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
