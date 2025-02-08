import axios from "axios";

const API_URL = "http://localhost:5000/api/subscription"; // Adjust based on your backend URL

export const getSubscriptionPlans = async () => {
  const response = await axios.get(`${API_URL}/plans`);
  return response.data;
};

export const createCheckoutSession = async (planId) => {
  const response = await axios.post(`${API_URL}/create-payment-intent`, { planId });
  return response.data;
};
