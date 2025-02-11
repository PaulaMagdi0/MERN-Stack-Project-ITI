import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./subscription.css";

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication using backend API
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/auth/user", { withCredentials: true }) // Ensure cookies are sent
      
      .then((response) => {
        
        if (response.status === 200) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });

    axios
      .get("http://localhost:5000/subscriptionsPlan")
      .then((response) => {
        const validPlans = response.data.filter((plan) => plan.Price > 0);
        setPlans(validPlans);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching subscription plans:", err);
        setError("Failed to load subscription plans.");
        setLoading(false);
      });
  }, []);

  const handleSelectPlan = (plan) => {
    navigate("/payment", {
      state: {
        planId: plan._id,
        amount: plan.Price,
        name: plan.Plan_name,
        duration: plan.Duration,
      },
    });
  };
  

  if (loading) return <p>Loading subscription plans...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="subscription-container container my-5">
      <h1 className="subscription-heading mb-5">Select Your Subscription Plan</h1>
      <div className="subscription-grid">
        {plans.map((plan) => (
          <div key={plan._id} className="subscription-card">
            <h2 className="subscription-name">{plan.Plan_name}</h2>
            <p className="subscription-duration">Duration: {plan.Duration} months</p>
            <p className="subscription-price">
              Price: <strong>${plan.Price.toFixed(2)}</strong> USD
            </p>
            <button
              className="subscription-button"
              onClick={() => handleSelectPlan(plan)}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
