// axios.js
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "https://mern-stack-project-iti-production.up.railway.app";

// Helper function to get the token from cookies or localStorage
const getToken = () => {
  const cookie = document.cookie.split('; ').find(row => row.startsWith('token='));
  if (cookie) {
    return cookie.split('=')[1];
  }
  return null;
};

const axiosInstance = axios.create({
  baseURL: API_URL, // Adjust the base URL for your API
});

// Intercept requests to add the Authorization header
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  } else {
    // Optionally, handle missing token here (e.g., redirect to login page)
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept responses to handle token expiry (e.g., 401 unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiry or unauthorized access
      // For example, redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
