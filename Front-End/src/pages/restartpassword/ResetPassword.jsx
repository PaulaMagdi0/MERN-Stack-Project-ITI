import React, { useEffect, useState } from "react";
import "./ResetPassword.css"; 
import { useLocation } from "react-router";
import queryString from "query-string"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState({
    password: '',
    confirmpassword: ''
  });
  const [invalidUser, setInvalidUser] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse token and id from the query parameters
  const { token, id } = queryString.parse(location.search);
  
  // Verify the reset token
  const verifyToken = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/verify-token?token=${token}&id=${id}`);
      console.log("Verify token response:", data);
      setBusy(false);
    } catch (error) {
      if (error?.response?.data) {
        const { data } = error.response;
        if (!data.success) {
          setInvalidUser(data.error);
          setBusy(false);
          return;
        }
      }
      console.error("Error verifying token:", error);
      setBusy(false);
    }
  };
  
  useEffect(() => {
    verifyToken();
  }, []);
  
  // If reset is successful, show success message and navigate to signin
  if (success) {
    return (
      <div className="reset-container">
        <div className="reset-box success-message message-box">
          <h1>Password reset successfully!</h1>
        </div>
      </div>
    );
  }
  
  // Show error if the token or user is invalid
  if (invalidUser) {
    return (
      <div className="reset-container">
        <div className="reset-box error-message message-box">
          <h1>{invalidUser}</h1>
        </div>
      </div>
    );
  }
  
  // Show loading indicator while busy verifying token or processing request
  if (busy) {
    return (
      <div className="reset-container">
        <div className="reset-box loading-message message-box">
          <h1>Please wait, verifying reset token...</h1>
        </div>
      </div>
    );
  }
  
  // Handle input changes for password fields
  const handleOnChange = ({ target }) => {
    const { name, value } = target;
    setNewPassword((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission to reset password
  const handleReset = async (e) => {
    e.preventDefault();
    const { password, confirmpassword } = newPassword;
    
    if (password.trim().length < 8 || password.trim().length > 20) {
      return setError("Password must be 8 to 20 characters");
    }
    
    if (password !== confirmpassword) {
      return setError("Passwords do not match");
    }
    
    try {
      setBusy(true);
      const { data } = await axios.post(
        `${API_URL}/users/reset-password?token=${token}&id=${id}`,
        { password: password.trim() }
      );
      console.log("Reset response:", data);
      if (data.success) {
        setSuccess(true);
        navigate('/signin');
      } else {
        setError(data.message || "Password reset failed");
      }
    } catch (error) {
      if (error?.response?.data) {
        const { data } = error.response;
        if (!data.success) {
          return setInvalidUser(data.error);
        }
        console.error("Error response:", data);
      } else {
        console.error("Error during password reset:", error);
      }
    } finally {
      setBusy(false);
    }
  };
  
  return (
    <div className="reset-container">
      <div className="reset-box">
        <h2 className="reset-title">Reset Password</h2>
        <form onSubmit={handleReset}>
          <div>
            <label className="reset-label">New Password</label>
            <input
              type="password"
              className="reset-input"
              name="password"
              value={newPassword.password}
              onChange={handleOnChange}
            />
            {error && <p className="reset-error">{error}</p>}
          </div>
  
          <div>
            <label className="reset-label">Confirm New Password</label>
            <input
              type="password"
              className="reset-input"
              name="confirmpassword"
              value={newPassword.confirmpassword}
              onChange={handleOnChange}
            />
          </div>
  
          <button className="reset-button" type="submit">
            Reset
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
