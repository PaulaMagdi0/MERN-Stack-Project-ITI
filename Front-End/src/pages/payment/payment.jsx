import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CardNumberElement, 
  CardExpiryElement, 
  CardCvcElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import './payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [cardName, setCardName] = useState('');

  const { planId, amount, name, duration } = location.state || {};

  useEffect(() => {
    axios.post('http://localhost:5000/api/payments/create-payment-intent', {
        amount: amount * 100, 
        currency: 'usd',
      })
      .then((res) => setClientSecret(res.data.clientSecret))
      .catch(() => setError('Failed to initiate payment. Please try again.'));
  }, [amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const cardElement = elements.getElement(CardNumberElement);

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (paymentError) {
      setError(paymentError.message);
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      navigate('/success', { state: { paymentIntent, planId, name, duration } });
    }
  };

  return (
    <div className="payment-container">
      <h1 className="payment-heading">Complete Your Payment</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="payment-details">
        <p><strong>Plan:</strong> {name}</p>
        <p><strong>Duration:</strong> {duration} months</p>
        <p><strong>Price:</strong> ${amount.toFixed(2)} USD</p>
      </div>

      {!clientSecret ? (
        <p>Loading payment details...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="card-icons">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" 
              alt="Visa" 
              className="card-logo"
            />
          </div>

          <div className="input-group">
            <label>Cardholder Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={cardName} 
              onChange={(e) => setCardName(e.target.value)}
              required 
            />
            <small className="input-hint">Enter the name as it appears on your card.</small>
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

          <button className="payment-button" type="submit" disabled={!stripe || processing}>
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Payment;
