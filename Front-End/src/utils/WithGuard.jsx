import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUserInfo } from "../store/authSlice";
import { useEffect } from "react";

const RequireAuth = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth); // Assume `status` indicates loading state
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      dispatch(getUserInfo());
    }
  }, [dispatch, user]);

  console.log(user?.role,loading);

  // Show loading while fetching user info
  if (status === "loading" || !user) {
    return <div>Loading...</div>; // You can replace this with a spinner
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAuth;
