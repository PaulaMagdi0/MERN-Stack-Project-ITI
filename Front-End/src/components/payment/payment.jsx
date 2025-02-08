// /client/src/components/PaymentPage.jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51QoOUWJabCknvdkPxNb7EyCRhTCMJsEZYxKY96rQN7pLfxQykWbk1dHhZCPmSfKLUUmfcZgUPeLWXyrItwpwwc6k00v1YWuxir');

const CheckoutForm = ({ amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        // Request a PaymentIntent from your backend
        const { data } = await axios.post('http://localhost:5000/api/payments/create-payment-intent', {
            amount: amount * 100, // Convert dollars to cents if needed
            currency: 'usd',
        });

        const clientSecret = data.clientSecret;

        const payload = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
            }
        });

        if (payload.error) {
            setError(`Payment failed: ${payload.error.message}`);
            setProcessing(false);
        } else {
            setError(null);
            setProcessing(false);
            setSucceeded(true);
            // Here you can also update the subscription in your backend if needed
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe || processing}>
                {processing ? "Processing…" : "Pay"}
            </button>
            {error && <div>{error}</div>}
            {succeeded && <div>Payment succeeded!</div>}
        </form>
    );
};

const PaymentPage = ({ amount }) => (
    <Elements stripe={stripePromise}>
        <CheckoutForm amount={amount} />
    </Elements>
);

export default PaymentPage;
