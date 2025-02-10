const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

exports.createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency } = req.body; // Ensure you send these from the frontend
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount,    // in cents
            currency,  // e.g., "usd"
        });
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Payment Error: ", error);
        res.status(500).json({ error: error.message });
    }
};
