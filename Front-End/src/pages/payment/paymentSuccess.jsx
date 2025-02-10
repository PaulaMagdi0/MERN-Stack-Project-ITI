import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import successAnimation from './success.json'; // Import Lottie animation
import './paymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate('/'); // Redirect to Home Page after 3 seconds
    }, 3000);
  }, [navigate]);

  return (
    <div className="success-container">
      <Lottie animationData={successAnimation} loop={false} className="success-icon" />
      <h2 className="success-text">Payment Success!</h2>
      <p className="redirect-text">Redirecting to the home page...</p>
      <div className="loading-spinner"></div>
    </div>
  );
};

export default PaymentSuccess;
