import { useEffect, useState } from "react";
import PropTypes from "prop-types"
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import styled, { keyframes } from "styled-components"
import { useSelector, useDispatch } from "react-redux";
import { getUserInfo } from "../store/authSlice";
import "react-toastify/dist/ReactToastify.css";

const WithGuardForLogging = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth); // Assume `status` indicates loading state
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      dispatch(getUserInfo());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
        setLoading(false);
        }
        
    if (!user) {
        setTimeout(() => setLoading(false), 5000); // Simulating a loading state
        toast.warning("⚠️ You must sign in or sign up to access this page!", {
        autoClose: 3000, // Show warning for 3 seconds
        position: "top-center",
      });

      setTimeout(() => {
        navigate("/");
      }, 4000); // Redirect to home after 4 seconds
    }
  }, [navigate, user]);

  return (
    <>
      <ToastContainer autoClose={3000} hideProgressBar closeOnClick draggable={false} />
      
      {loading ? (
        <div className="d-flex align-items-center justify-content-center vh-100">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4"></h2>
            <div className="space-y-3">
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </>
  );
};


const Shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
  `;

const SkeletonPulse = styled.div`
display: inline-block;
  height: 100%;
  width: 100%;
  background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
  background-size: 800px 104px;
  animation: ${Shimmer} 1.2s ease-in-out infinite;
`;

const SkeletonLine = styled(SkeletonPulse)`
  width: 100%;
  height: ${(props) => props.height || "15px"};
  margin-bottom: ${(props) => props.marginBottom || "10px"};
  border-radius: 4px;
  `;

  
  const SkeletonLoader = ({ lines = 1, height, marginBottom }) => (
    <SkeletonPulse>
      {Array(lines)
        .fill()
        .map((_, i) => (
          <SkeletonLine key={i} height={height} marginBottom={marginBottom} />
        ))}
    </SkeletonPulse>
  );
  
  SkeletonLoader.propTypes = {
    lines: PropTypes.number,
    height: PropTypes.string,
    marginBottom: PropTypes.string,
  };

export default WithGuardForLogging;
