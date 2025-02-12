import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useSelector, useDispatch } from "react-redux";
import { getUserInfo } from "../../store/authSlice";
import "./payment.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Payment = () => {
  const { planID } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const stripe = useStripe();
  const elements = useElements();

  const [planToSelect, setPlanToSelect] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [cardName, setCardName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const userId = user?._id || null;

  const amount = planToSelect?.Price || null;
  const planName = planToSelect?.planName || planToSelect?.Plan_name || null;
  const planId = planToSelect?._id || null;
  const duration = planToSelect?.duration || null;
  const userEmail = user?.email || null;

  useEffect(() => {
    dispatch(getUserInfo());
  }, [dispatch]);

  useEffect(() => {
    const fetchPlan = async () => {
      if (planID) {
        try {
          const response = await axios.get(`${API_URL}/subscriptionsPlan/${planID}`);
          setPlanToSelect(response.data);
        } catch (err) {
          console.error("Error fetching subscription plan:", err);
          setError("Failed to fetch plan details. Please try again.");
        }
      }
    };

    fetchPlan();
  }, [planID]);

  useEffect(() => {
    const initializePaymentIntent = async () => {
      if (!planToSelect?.Price || !planToSelect?._id || !userId) {
        setLoading(false);
        return;
      }

      if (email && email !== user?.email) {
        setError("Email does not match the one in your account.");
        setLoading(false);
        return;
      }

      const payload = {
        amount: amount * 100, // Convert dollars to cents
        currency: "usd",
        subscriptionPlanId: planId,
        userId,
        planName: planName,
        email: userEmail,
      };

      console.log("Sending payment intent request with data:", payload); // Log the request payload

      try {
        // Setting loading to true before starting the request
        setLoading(true);

        // Sending request to create payment intent
        const response = await axios.post(`${API_URL}/api/payments/create-payment-intent`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Ensure the response contains clientSecret
        if (response.data.clientSecret) {
          setClientSecret(response.data.clientSecret);
        } else {
          setError("Failed to initialize payment. Please try again.");
        }
      } catch (err) {
        // Log the full error for debugging purposes
        console.error("Backend error:", err);
        setError("Failed to initialize payment. Please try again.");
      } finally {
        // Ensure loading is set to false after the operation completes
        setLoading(false);
      }
    };

    initializePaymentIntent();
  }, [amount, planId, userId, planToSelect, userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    setError("");

    // Check if the email matches the one in the account
    if (email !== user?.email) {
      setError("Email does not match the one in your account.");
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardNumberElement);

    try {
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: cardName, email: email },
        },
      });

      if (paymentError) {
        setError(paymentError.message);
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        navigate("/success", { state: { paymentIntent, planId, planName, duration } });
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An error occurred while processing your payment.");
      setProcessing(false);
    }
  };

  return (
    <div className="payment-container">
      <h1 className="payment-heading">Complete Your Payment</h1>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading payment details...</p>
      ) : (
        <>
          <div className="payment-details">
            <p><strong>Plan:</strong> {planName}</p>
            <p><strong>Duration:</strong> {duration} months</p>
            <p><strong>Price:</strong> ${amount?.toFixed(2)} USD</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card-icons">
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="card-logo" />
            </div>

            <div className="input-group">
              <label htmlFor="cardholder-name">Cardholder Name</label>
              <input
                id="cardholder-name"
                type="text"
                className="input-field"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Card Number</label>
              <CardNumberElement className="stripe-input" />
            </div>

            <div className="card-details">
              <div className="input-group half-width">
                <label>Expiry Date</label>
                <CardExpiryElement className="stripe-input" />
              </div>
              <div className="input-group half-width">
                <label>CVC</label>
                <CardCvcElement className="stripe-input" />
              </div>
            </div>

            <button
              className="payment-button"
              type="submit"
              disabled={!stripe || processing}
            >
              {processing ? "Processing..." : "Pay Now"}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Payment;
