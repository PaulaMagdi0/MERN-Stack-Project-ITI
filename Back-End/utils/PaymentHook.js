const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/subscription');
const User = require('../models/users');
const SubscriptionPlan = require('../models/subscriptionplan'); // Add this for plan duration

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    // Construct the event using the raw request body and signature
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { userId, subscriptionPlanId } = paymentIntent.metadata;

    try {
      if (!userId || !subscriptionPlanId) {
        console.error("Missing userId or subscriptionPlanId in webhook metadata.");
        return res.status(400).json({ message: "Invalid webhook metadata" });
      }

      // Ensure the user exists
      const user = await User.findById(userId);
      if (!user) {
        console.error(`User with ID ${userId} not found.`);
        return res.status(404).json({ message: "User not found" });
      }

      // Find the subscription plan to get the duration
      const plan = await SubscriptionPlan.findById(subscriptionPlanId);
      if (!plan) {
        console.error(`Subscription plan with ID ${subscriptionPlanId} not found.`);
        return res.status(404).json({ message: "Subscription plan not found" });
      }

      // Calculate subscription duration (assuming plan.Duration is in months)
      const subscriptionDuration = plan.Duration || 1; // Default to 1 month if not specified

      // Check if the user already has a subscription
      let subscription = await Subscription.findOne({ user: userId });

      if (subscription) {
        // Update existing subscription
        subscription.plan = subscriptionPlanId;
        subscription.startDate = new Date();
        subscription.endDate = new Date(new Date().setMonth(new Date().getMonth() + subscriptionDuration)); 
        await subscription.save();
        console.log(`Updated subscription for user ${userId} to plan ${subscriptionPlanId}.`);
      } else {
        // Create a new subscription if none exists
        subscription = new Subscription({
          user: userId,
          plan: subscriptionPlanId,
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + subscriptionDuration)), 
        });
        await subscription.save();
        console.log(`New subscription created for user ${userId} with plan ${subscriptionPlanId}.`);
      }

    } catch (err) {
      console.error("Error updating or creating subscription:", err);
      return res.status(500).json({ message: `Error: ${err.message}` });
    }
  }

  // Respond to Stripe indicating the event was handled
  res.json({ received: true });
};
