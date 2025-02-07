require("dotenv").config();
const express = require("express");

const { authenticateToken } = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");
const { signIn, getUserInfo, UpdateUserInfo, signUp } = require("../controllers/userController");

const router = express.Router();

// Rate limiting for signup and signin
const signupSigninLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});

// Signup Route
router.post("/sign-up", signupSigninLimiter, signUp);  // ✅ Fixed

// Signin Route
router.post("/sign-in", signupSigninLimiter, signIn);

// Get User Info
router.get("/get-user-info", authenticateToken, getUserInfo);

// Update Profile
router.put("/update-profile", authenticateToken, UpdateUserInfo);  // ✅ Fixed

module.exports = router;
