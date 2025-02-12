const User = require("../models/users");
const Subscription = require("../models/subscription");
const SubscriptionPlan = require("../models/subscriptionplan");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a PaymentIntent for processing payments
exports.createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency, userId, subscriptionPlanId, planName, email } = req.body;
    
        console.log("Received payment data:", { amount, currency, userId, subscriptionPlanId, planName, email });

        // Validate input data
        if (!amount || !currency || !userId || !subscriptionPlanId || !email) {
            return res.status(400).json({ success: false, message: "Missing required payment information." });
        }

        if (typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ success: false, message: "Amount must be a positive number." });
        }

        if (typeof currency !== "string" || typeof userId !== "string" || typeof subscriptionPlanId !== "string" || typeof email !== "string") {
            return res.status(400).json({ success: false, message: "Invalid data format." });
        }

        // Fetch user from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Check if the provided email matches the one in the database
        if (user.email !== email) {
            console.log("Email mismatch: Expected:", user.email, "Received:", email);
            return res.status(400).json({ success: false, message: "Email does not match the one in your account." });
        }
        
        // Convert amount to cents
        const finalAmount = Math.round(amount * 100); // Stripe requires amount in cents

        // Create a PaymentIntent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmount,
            currency,
            payment_method_types: ['card'],
            receipt_email: email,
            metadata: { userId, subscriptionPlanId, planName },
        });

        console.log("Created PaymentIntent ID:", paymentIntent.id);

        // Return the client secret to the frontend to complete the payment
        handlePaymentSuccess(paymentIntent.id, userId, subscriptionPlanId);
        res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("❌ Payment Processing Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong while processing the payment." });
    }
};

// Handle payment success
const handlePaymentSuccess = async (paymentIntentId, userId, subscriptionPlanId) => {
    try {
        console.log("Handling payment success for PaymentIntent ID:", paymentIntentId);

        // Retrieve the PaymentIntent from Stripe to confirm its status
        // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Check if the payment was successful
        if (!paymentIntentId ) {
            console.log("❌ Payment failed.");
            return;
        }

        // Fetch the subscription plan from the database
        const plan = await SubscriptionPlan.findById(subscriptionPlanId);
        if (!plan) {
            console.log("❌ Subscription plan not found.");
            return;
        }

        const currentDate = new Date();
        const renewalDate = new Date(currentDate.getTime() + plan.Duration * 30 * 24 * 60 * 60 * 1000); // Approximate month

        // Update or create subscription for the user
        let subscription = await Subscription.findOne({ userId });

        if (!subscription) {
            subscription = new Subscription({
                userId,
                planId: subscriptionPlanId,
                subscriptionDate: currentDate,
                renewalDate: renewalDate,
            });
        } else {
            subscription.planId = subscriptionPlanId;
            subscription.subscriptionDate = currentDate;
            subscription.renewalDate = renewalDate;
        }

        await subscription.save();

        console.log("✅ Payment successful, subscription updated.");

    } catch (error) {
        console.error("❌ Error in handling payment success:", error);
    }
};