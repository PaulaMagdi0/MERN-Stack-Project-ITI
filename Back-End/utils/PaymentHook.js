// // PaymentHook.js (Webhook Handler)
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const User = require("../models/users");
// const Subscription = require("../models/subscription");
// const SubscriptionPlan = require("../models/subscriptionplan");

// // You can skip signature verification in mock mode, since we're not using real Stripe events.
// exports.handleStripeWebhook = async (mockEvent, res) => {
//   let event = mockEvent; // Use the mock event passed from the route

//   // Handle different Stripe event types
//   switch (event.type) {
//     case "payment_intent.succeeded":
//       const paymentIntent = event.data.object;
//       // Handle successful payment
//       await handlePaymentSuccess(paymentIntent);
//       break;
//     case "payment_intent.payment_failed":
//       const failedPaymentIntent = event.data.object;
//       // Handle failed payment
//       await handlePaymentFailure(failedPaymentIntent);
//       break;
//     default:
//       console.log(`Unhandled event type: ${event.type}`);
//   }

//   // Acknowledge receipt of the event
//   res.json({ received: true });
// };

// // Handle payment success and update subscription
// const handlePaymentSuccess = async (paymentIntent) => {
//   try {
//     const { metadata } = paymentIntent;
//     const { userId, subscriptionPlanId } = metadata;

//     // Find the user who made the payment
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log("User not found for payment intent.");
//       return;
//     }

//     // Find the selected subscription plan
//     const subscriptionPlan = await SubscriptionPlan.findById(subscriptionPlanId);
//     if (!subscriptionPlan) {
//       console.log("Subscription plan not found.");
//       return;
//     }

//     // Check if the user already has an existing subscription
//     let subscription = await Subscription.findOne({ userId });
//     if (!subscription) {
//       // Create a new subscription if it doesn't exist
//       subscription = new Subscription({
//         userId,
//         planId: subscriptionPlanId,
//         subscriptionDate: new Date(),
//         renewalDate: calculateRenewalDate(subscriptionPlan),
//       });
//     } else {
//       // Update the existing subscription with the new plan
//       subscription.planId = subscriptionPlanId;
//       subscription.subscriptionDate = new Date();
//       subscription.renewalDate = calculateRenewalDate(subscriptionPlan);
//     }

//     // Save or update the subscription in the database
//     await subscription.save();

//     console.log("Payment success handled. Subscription updated.");

//   } catch (err) {
//     console.error("Error processing payment success:", err);
//   }
// };

// // Calculate the renewal date based on the subscription plan duration
// const calculateRenewalDate = (subscriptionPlan) => {
//   const renewalDate = new Date();
//   renewalDate.setMonth(renewalDate.getMonth() + subscriptionPlan.Duration);
//   return renewalDate;
// };

// // Handle failed payment and notify the user
// const handlePaymentFailure = async (paymentIntent) => {
//   try {
//     const { metadata } = paymentIntent;
//     const { userId } = metadata;

//     // Handle the failed payment, e.g., notify the user
//     const user = await User.findById(userId);
//     if (user) {
//       console.log(`Payment failed for user: ${user.email}`);
//     }

//     // Additional failure logic, like alerting or retrying, could go here.
//   } catch (err) {
//     console.error("Error processing payment failure:", err);
//   }
// };
