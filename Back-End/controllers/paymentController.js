const User = require("../models/users");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
    try {
        // Extract data from the request body
        const { amount, currency, userId, subscriptionPlanId, planName, email } = req.body;

        // Log received data for debugging purposes
        console.log("Received payment data:", { amount, currency, userId, subscriptionPlanId, planName, email });

        // Validate input data
        if (!amount || !currency || !userId || !subscriptionPlanId || !email) {
            return res.status(400).json({ message: "Missing required payment information." });
        }

        if (typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ message: "Amount must be a positive number." });
        }

        if (typeof currency !== "string" || typeof userId !== "string" || typeof subscriptionPlanId !== "string" || typeof email !== "string") {
            return res.status(400).json({ message: "Invalid data format." });
        }

        // Fetch user from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the provided email matches the one in the database
        if (user.email !== email) {
            console.log("Email mismatch: Expected:", user.email, "Received:", email);
            return res.status(400).json({ message: "Email does not match the one in your account." });
        }

        // Convert amount to cents
        const finalAmount = Math.round(amount * 100); // Stripe requires amount in cents

        // Create a PaymentIntent with the provided details
        const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmount,
            currency,
            metadata: { userId, subscriptionPlanId, planName },
        });

        // Return the client secret to the frontend to complete the payment
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("❌ Payment Processing Error:", error);
        res.status(500).json({ message: "Something went wrong while processing the payment." });
    }
};
