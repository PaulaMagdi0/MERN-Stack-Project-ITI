// src/components/subscription/subscriptionPlan.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/subscriptionsPlan')
      .then(response => {
        setPlans(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching subscription plans:', err);
        setError('Failed to load subscription plans.');
        setLoading(false);
      });
  }, []);

  const handleSelectPlan = (plan) => {
    // Navigate to the Payment page and pass selected plan details.
    navigate('/payment', { state: { planId: plan._id, amount: plan.amount, currency: plan.currency || 'usd' } });
  };

  if (loading) return <p>Loading subscription plans...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Select Your Subscription Plan</h1>
      {plans.map(plan => (
        <div key={plan._id}>
          <h2>{plan.name}</h2>
          <p>{plan.description}</p>
          <p>
            Price: <strong>${(plan.amount / 100).toFixed(2)}</strong>{' '}
            {plan.currency ? plan.currency.toUpperCase() : 'USD'}
          </p>
          <button onClick={() => handleSelectPlan(plan)}>Subscribe</button>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionPlans;
