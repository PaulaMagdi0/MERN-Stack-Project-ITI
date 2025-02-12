import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { getUserInfo } from "../../store/authSlice"; // Correct path to your auth slice
import "./subscription.css";

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Access user authentication state from Redux store
  const { user, isLoggedIn } = useSelector((state) => state.auth);

  // Check if the user is authenticated on component load
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      dispatch(getUserInfo()); // Fetch user info if logged in
    } else {
      setIsAuthenticated(false);
    }

    // Fetch subscription plans
    axios
      .get(`${API_URL}/subscriptionsPlan`)
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
  }, [isLoggedIn, dispatch]);

  const handleSelectPlan = (plan) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate("/signin");
    } else {
      navigate(`/payment/${plan._id}`);
    }
  };

  if (loading) return <p>Loading subscription plans...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="subscription-container container my-5">
      <h1 className="subscription-heading mb-5">Select Your Subscription Plan</h1>

      {isAuthenticated && user ? (
        <p>Welcome, {user.username}! Choose your subscription plan below.</p>
      ) : (
        <p>Please log in to access subscription plans.</p>
      )}

      <div className="subscription-grid">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`subscription-card ${plan.Plan_name.toLowerCase()}`}
          >
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
