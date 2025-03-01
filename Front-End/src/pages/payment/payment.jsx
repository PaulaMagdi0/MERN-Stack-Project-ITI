"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useSelector, useDispatch } from "react-redux"
import { getUserInfo } from "../../store/authSlice"
import "./payment.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
//  4000000000009995  Insufficient funds. Payment failed
//  4000000000000069  Expired card. Payment failed
//  4000000000000028  Card declined. Payment failed
const Payment = () => {
  const { planID } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const stripe = useStripe()
  const elements = useElements()

  const [planToSelect, setPlanToSelect] = useState(null)
  const [cardName, setCardName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const { user } = useSelector((state) => state.auth)
  const userId = user?._id || null

  const amount = planToSelect?.Price || 0
  const planName = planToSelect?.planName || planToSelect?.Plan_name || null
  const planId = planToSelect?._id || null
  const duration = planToSelect?.duration || null
  const userEmail = user?.email || null

  useEffect(() => {
    dispatch(getUserInfo())
  }, [dispatch])

  useEffect(() => {
    const fetchPlan = async () => {
      if (planID) {
        try {
          const response = await axios.get(`${API_URL}/subscriptionsPlan/${planID}`)
          setPlanToSelect(response.data)
          setLoading(false)
        } catch (err) {
          console.error("Error fetching subscription plan:", err)
          setError("Failed to fetch plan details. Please try again.")
          setLoading(false)
        }
      }
    }
    fetchPlan()
  }, [planID])
  const handleSubmit = async (e) => {
    e.preventDefault()
  
    if (!stripe || !elements) {
      setError("Stripe is not ready.")
      return
    }
  
    setProcessing(true)
    setError("")
  
    if (email !== user?.email) {
      setError("Email does not match the one in your account.")
      setProcessing(false)
      return
    }
  
    if (!cardName.trim()) {
      setError("Please provide a cardholder name.")
      setProcessing(false)
      return
    }
  
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError("Card element not found.")
      setProcessing(false)
      return
    }
  
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { name: cardName, email: email },
      })
  
      if (error) {
        if (error.code === "card_expired") {
          setError("Your card has expired. Please use a valid card.")
        } else {
          setError(error.message)
        }
        setProcessing(false)
        return
      }
  
      // Simulate payment failure for specific test cards
      if (paymentMethod.card.last4 === "9995") { // Insufficient funds
        setError("Insufficient funds. Payment failed.")
        setProcessing(false)
        return
      }
  
      if (paymentMethod.card.last4 === "0069") { // Expired card
        setError("Your card has expired. Please use a valid card.")
        setProcessing(false)
        return
      }
  
      if (paymentMethod.card.last4 === "0028") { // Card declined
        setError("Your card has been declined. Please check with your bank.")
        setProcessing(false)
        return
      }
  
      // Proceed with sending the payment method ID to the backend
      const response = await axios.post(`${API_URL}/api/payments/create-payment-intent`, {
        paymentMethodId: paymentMethod.id,
        amount: amount * 100, // Convert to cents
        currency: "usd",
        subscriptionPlanId: planId,
        userId,
        planName,
        email: userEmail,
        cardnumber :paymentMethod.card
      })
  
      if (response.data.success) {
        navigate("/success", { state: { paymentIntent: response.data.paymentIntent, planId, planName, duration } })
      } else {
        setError(response.data.message || "Payment failed. Please try again.")
      }
    } catch (err) {
      console.error("Payment error:", err)
      setError("An error occurred while processing your payment.")
    } finally {
      setProcessing(false)
    }
  }
  if (loading) {
    return <p>Loading payment details...</p>
  }

  return (
    <div className="payment-container">
      <h1 className="payment-heading">Complete Your Payment</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="payment-details">
        <p>
          <strong>Plan:</strong> {planName}
        </p>
        <p>
          <strong>Duration:</strong> {duration} months
        </p>
        <p>
          <strong>Price:</strong> ${amount.toFixed(2)} USD
        </p>
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
          <label>Card Details</label>
          <CardElement className="stripe-input" />
        </div>

        <button className="payment-button" type="submit" disabled={!stripe || processing}>
          {processing ? "Processing..." : "Pay Now"}
        </button>
      </form>
    </div>
  )
}

export default Payment
