require("dotenv").config();
const Subscription = require("../models/subscription");
const SubscriptionPlan = require("../models/subscriptionplan");
const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const crypto = require("crypto");
const TempUser = require('../models/tempUser');
const { isValidObjectId } = require("mongoose");
const { generateOtp, mailTransport, GeneratePasswordResetTemplate } = require("../utils/mail");
const VerifyToken = require("../models/verificationtokens");
const ResetToken = require("../models/resetToken");
const { log } = require("console");
const cloudinary = require('../config/cloudinaryConfig'); // Cloudinary config
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Utility function for sending errors
const sendError = (res, message, status = 400) => {
  return res.status(status).json({ success: false, error: message });
};

// controllers/userController.js
exports.signup = async (req, res) => {
  try {
    const { username, email, password, address, phone, dateOfBirth } = req.body;

    // Validate required fields
    if (!username || !email || !password || !phone) {
      return res.status(400).json({ message: "Username, email, password, and phone are required." });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    // Check for existing temp user and remove if exists
    await TempUser.deleteOne({ email });

    // Hash password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // Generate OTP
    const OTP = generateOtp();

    // Store temporary user data and OTP
    const tempUser = new TempUser({
      username,
      email,
      password: hashedPassword,
      address,
      phone,
      dateOfBirth,
      otp: OTP,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
    });

    await tempUser.save();

    // Send email with OTP
    await mailTransport().sendMail({
      from: "emailverification@email.com",
      to: email,
      subject: "Welcome to BookHub - Verify Your Email",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to BookHub!</h2>
                    <p>Your OTP for account verification is:</p>
                    <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${OTP}</h1>
                    <p>This code will expire in 15 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
            `,
    });

    // Schedule cleanup of temporary data
    setTimeout(async () => {
      await TempUser.deleteOne({ _id: tempUser._id });
      console.log(`Temporary user data cleaned up for ${email}`);
    }, 15 * 60 * 1000);

    return res.status(200).json({
      message: "Please verify your email to complete signup.",
      tempUserId: tempUser._id
    });

  } catch (error) {
    console.error("Error during signup initiation:", error);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { tempUserId } = req.body;

    const tempUser = await TempUser.findById(tempUserId);
    if (!tempUser) {
      return res.status(400).json({ message: "Invalid or expired signup session. Please sign up again." });
    }

    const newOTP = generateOtp();

    tempUser.otp = newOTP;
    tempUser.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await tempUser.save();

    await mailTransport().sendMail({
      from: "emailverification@email.com",
      to: tempUser.email,
      subject: "BookHub - New Verification Code",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Your New Verification Code</h2>
                    <p>Here's your new OTP:</p>
                    <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${newOTP}</h1>
                    <p>This code will expire in 15 minutes.</p>
                </div>
            `,
    });

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully"
    });

  } catch (error) {
    console.error("Error resending OTP:", error);
    return res.status(500).json({ message: "Failed to resend OTP. Please try again." });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { tempUserId, otp } = req.body;

    if (!tempUserId || !otp?.trim()) {
      return res.status(400).json({ success: false, message: "Invalid request, missing parameters" });
    }

    if (!isValidObjectId(tempUserId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Find the temporary user
    const tempUser = await TempUser.findById(tempUserId);
    if (!tempUser) {
      return res.status(400).json({ success: false, message: "Signup session expired or invalid. Please sign up again." });
    }

    // Check if OTP matches
    if (tempUser.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }

    // Check if OTP has expired
    if (tempUser.expiresAt < new Date()) {
      await TempUser.deleteOne({ _id: tempUserId });
      return res.status(400).json({ success: false, message: "OTP has expired. Please signup again." });
    }

    // Create the actual user
    const newUser = new User({
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password,
      address: tempUser.address,
      phone: tempUser.phone,
      dateOfBirth: tempUser.dateOfBirth,
      verified: true
    });

    await newUser.save();

    // Set up default subscription plan
    const defaultPlan = await SubscriptionPlan.findOne({ Plan_name: "default" });
    if (!defaultPlan) {
      await User.deleteOne({ _id: newUser._id });
      return res.status(500).json({ success: false, message: "Error setting up user account. Please try again." });
    }

    // Create subscription
    const subscription = new Subscription({
      userId: newUser._id,
      planId: defaultPlan._id,
      subscriptionDate: new Date(),
      renewalDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    });

    await subscription.save();

    // Clean up temporary user data
    await TempUser.deleteOne({ _id: tempUserId });

    // Send welcome email
    await mailTransport().sendMail({
      from: "emailverification@email.com",
      to: newUser.email,
      subject: "Welcome to BookHub!",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #007bff;">Welcome to BookHub!</h1>
                    <p>Your email has been verified successfully. You can now sign in to your account.</p>
                    <p>Thank you for joining our community!</p>
                </div>
            `,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      userId: newUser._id
    });

  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again." });
  }
};
exports.verifyAndCreateUser = async (req, res) => {
  try {
    const { tempUserId, otp } = req.body;

    const tempUser = await TempUser.findById(tempUserId);
    if (!tempUser) {
      return res.status(400).json({ message: "Invalid or expired signup attempt." });
    }

    if (tempUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (tempUser.expiresAt < new Date()) {
      await TempUser.deleteOne({ _id: tempUserId });
      return res.status(400).json({ message: "OTP has expired. Please signup again." });
    }

    // Create actual user
    const newUser = new User({
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password,
      address: tempUser.address,
      phone: tempUser.phone,
      dateOfBirth: tempUser.dateOfBirth,
      isVerified: true
    });

    await newUser.save();

    // Find and assign default subscription plan
    const defaultPlan = await SubscriptionPlan.findOne({ Plan_name: "default" });
    if (!defaultPlan) {
      await User.deleteOne({ _id: newUser._id });
      return res.status(500).json({ message: "No default subscription plan found. Signup failed." });
    }

    // Create subscription
    const subscription = new Subscription({
      userId: newUser._id,
      planId: defaultPlan._id,
      subscriptionDate: new Date(),
      renewalDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    });

    await subscription.save();

    // Clean up temporary data
    await TempUser.deleteOne({ _id: tempUserId });

    return res.status(201).json({
      message: "Signup completed successfully.",
      userId: newUser._id
    });

  } catch (error) {
    console.error("Error during verification and user creation:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// -------------------
// Signin Controller
// -------------------
exports.signin = async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." })
    }

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." })
    }

    const isCorrect = await bcrypt.compare(password, user.password)
    if (!isCorrect) {
      return res.status(400).json({ message: "Invalid credentials." })
    }

    const tokenExpiration = rememberMe ? "7d" : "1h" // 1 hour for session, 7 days for remember me
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: tokenExpiration,
    })

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, // Set false locally
      sameSite: "none",
    };
    
  
    if (rememberMe) {
      cookieOptions["maxAge"] = 7 * 24 * 60 * 60 * 1000 // 7 days
    }

    res.cookie("token", token, cookieOptions)
    res.status(200).json({
      id: user._id,
      role: user.role,
      rememberMe,
      message: "Sign in successful",
    })
  } catch (error) {
    console.error("Error during sign in:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}

// -------------------
// Get User Info Controller
// -------------------

exports.getUserInfo = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log("Invalid or expired token");
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      // Fetch the user by ID (excluding the password field)
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        console.log("User not found:", decoded.id);
        return res.status(404).json({ message: "User not found" });
      }

      // Fetch the subscription for the user
      const subscription = await Subscription.findOne({ userId: user._id });
      if (!subscription) {
        console.log("No subscription found for user:", user._id);
        // Return user without subscription info if none found
        return res.json(user);
      }

      // Fetch the subscription plan details
      const subscriptionPlan = await SubscriptionPlan.findById(subscription.planId);
      if (!subscriptionPlan) {
        console.log("Subscription plan not found for planId:", subscription.planId);
        return res.status(404).json({ message: "Subscription plan not found" });
      }

      // Merging user with subscription and subscription plan details
      const userWithSubscription = {
        ...user.toObject(), // Convert mongoose object to plain JS object
        subscription: {
          _id: subscription._id,
          startDate: subscription.subscriptionDate,
          endDate: subscription.renewalDate,
          plan: {
            _id: subscriptionPlan._id,
            planName: subscriptionPlan.Plan_name,
            price: subscriptionPlan.Price,
            duration: subscriptionPlan.Duration,
          },
        },
      };

      // Log the final object before sending the response
      // console.log("Sending response with user and subscription:", userWithSubscription);
      
      // Send the final response
      return res.json(userWithSubscription);
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------
// Update Profile Controller
// -------------------

exports.UpdateUserInfo = async (req, res) => {
  try {
    // Assuming req.user is set by your authentication middleware
    const { id } = req.user;
    const updateData = {};
    const allowedFields = ["username", "email", "address", "phone", "dateOfBirth"];
    console.log("UpdateUserInfo", req.body);
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0 && !req.body.planId && !req.file) {
      return res.status(400).json({ message: "No data provided for update." });
    }

    if (updateData.username && updateData.username.length < 4) {
      return res.status(400).json({ message: "Username must be at least 4 characters long." });
    }

    if (updateData.email) {
      const emailExists = await User.findOne({ email: updateData.email });
      if (emailExists && emailExists._id.toString() !== id) {
        return res.status(400).json({ message: "Email already exists." });
      }
    }

    // If an image is uploaded, handle Cloudinary upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "user_images", // specify a folder in Cloudinary
      });
      updateData.image = result.secure_url; // Store the Cloudinary image URL in the user's record
    }

    // Update user info
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    // (Optional) Update subscription if planId is provided
    if (req.body.planId) {
      const planId = req.body.planId;
      if (!isValidObjectId(planId)) {
        return res.status(400).json({ message: "Invalid plan ID format." });
      }

      let subscription = await Subscription.findOne({ userId: id });
      if (subscription) {
        subscription.planId = planId;
        subscription.subscriptionDate = new Date();
        await subscription.save();
      } else {
        subscription = new Subscription({
          userId: id,
          planId,
          subscriptionDate: new Date(),
        });
        await subscription.save();
      }
    }

    res.status(200).json({ message: "Profile updated successfully.", updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// -------------------
// Logout Controller
// -------------------
exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

// -------------------
// Forget Password Controller
// -------------------
exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please provide a valid email." });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found." });

  const existingToken = await ResetToken.findOne({ owner: user._id });
  if (existingToken) return res.status(400).json({ message: "Only after one hour can you request another token." });

  // Use generateOtp as token generator (or you could use crypto.randomBytes if desired)
  const randomBytes = await generateOtp();
  const resetToken = new ResetToken({ owner: user._id, token: randomBytes });

  await resetToken.save();
  const resetUrl = `https://bookhub-psi.vercel.app/reset-password?token=${randomBytes}&id=${user._id}`;

  mailTransport().sendMail({
    from: "security@email.com",
    to: user.email,
    subject: "Password Reset",
    html: GeneratePasswordResetTemplate(resetUrl)
  });

  return res.json({ message: "Password reset link is sent to your email." });
};

// -------------------
// Reset Password Controller
// -------------------

// Assume sendError is defined somewhere in your codebase

exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  try {
    console.log("Password = ", password, "userID = ", req.user);

    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, "User not found!");

    const isSamePass = await user.comparePassword(password);
    if (isSamePass) return sendError(res, "New password must be different!");

    if (password.trim().length < 8 || password.trim().length > 20) {
      return sendError(res, "New password must be between 8 and 20 characters!");
    }

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    user.password = hashedPassword;
    await user.save();

    // Remove reset token after password reset
    await ResetToken.findOneAndDelete({ owner: user._id });

    // Send confirmation email
    await mailTransport().sendMail({
      from: "security@email.com",
      to: user.email,
      subject: "Password Reset Successfully",
      html: "<h1>Congrats! Your password has been reset successfully.</h1>",
    });

    res.json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
};
// const { isValidObjectId } = require("mongoose");
// const User = require("../models/users");
// const VerifyToken = require("../models/verificationtokens");
// const { mailTransport } = require("../utils/mail");

// Utility function for sending errors (make sure this is defined or imported)
// const sendError = (res, message, status = 400) => {
//   return res.status(status).json({ success: false, error: message });
// };

2