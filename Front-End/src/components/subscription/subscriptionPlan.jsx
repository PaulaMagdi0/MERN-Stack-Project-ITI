import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './subscription.css'; // Optional: import your CSS for styling

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Replace with your backend URL/endpoint as needed.
    axios
      .get('http://localhost:5000/subscriptionsPlan')
      .then((response) => {
        // Assuming the API returns an array of plans
        setPlans(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching subscription plans:', err);
        setError('Failed to load subscription plans. Please try again later.');
        setLoading(false);
      });
  }, []);

  const handleSubscribe = (planId) => {
    // Navigate to the payment page while passing along the selected plan's id
    navigate('/payment', { state: { planId } });
  };

  if (loading) {
    return <div className="subscription-loading">Loading subscription plans...</div>;
  }

  if (error) {
    return <div className="subscription-error">{error}</div>;
  }

  return (
    <div className="subscription-plans-container">
      <h1>Choose Your Subscription Plan</h1>
      <div className="plans-list">
        {plans.map((plan) => (
          <div key={plan._id} className="plan-card">
            <h2 className="plan-name">{plan.name}</h2>
            <p className="plan-description">{plan.description}</p>
            <p className="plan-price">
              Price: <strong>${plan.price}</strong>
            </p>
            <button onClick={() => handleSubscribe(plan._id)} className="subscribe-button">
              Subscribe Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
