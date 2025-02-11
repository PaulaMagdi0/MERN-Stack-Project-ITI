// // controllers/userController.js

// // Ensure that environment variables are loaded (this should already be done in your server.js,
// // so you don't need to call it here if your entry point already does it).
// // require("dotenv").config();
// const Subscription = require("../models/subscription");
// const SubscriptionPlan = require("../models/subscriptionplan");
// const User = require("../models/users");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const validator = require("validator");

// // Use a single constant for the JWT secret throughout the controller.
// const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// // Get all users
// exports.getUsers = async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching users" });
//   }
// };

// // User Signup
// // exports.signUp = async (req, res) => {
// //   try {
// //     const { username, email, password, address, phone, dateOfBirth } = req.body;

// //     // Check for missing fields
// //     if (!username || !email || !password || !phone) {
// //       return res.status(400).json({ message: "Username, email, password, and phone are required." });
// //     }

// //     // Validate email format
// //     if (!validator.isEmail(email)) {
// //       return res.status(400).json({ message: "Invalid email format." });
// //     }

// //     // Validate phone number (using a generic check; you may adjust as needed)
// //     if (!validator.isMobilePhone(phone, "any", { strictMode: false })) {
// //       return res.status(400).json({ message: "Invalid phone number." });
// //     }

// //     if (username.length < 4) {
// //       return res.status(400).json({ message: "Username must be at least 4 characters long." });
// //     }

// //     // Check if username or email already exists
// //     const existingUser = await User.findOne({ $or: [{ username }, { email }] });
// //     if (existingUser) {
// //       return res.status(400).json({ message: "Username or email already exists." });
// //     }

// //     if (password.length < 6) {
// //       return res.status(400).json({ message: "Password must be at least 6 characters long." });
// //     }

// //     if (phone.length < 10) {
// //       return res.status(400).json({ message: "Phone number must be at least 10 digits long." });
// //     }

// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const role = email === "admin@gmail.com" ? "admin" : "user";

// //     const newUser = new User({ username, email, password: hashedPassword, address, phone, dateOfBirth, role });
// //     await newUser.save();

// //     return res.status(201).json({ message: "Signup successful." });
// //   } catch (error) {
// //     console.error("Error during signup:", error);
// //     res.status(500).json({ message: "Internal server error." });
// //   }
// // };

// exports.signUp = async (req, res) => {
//   try {
//     // Destructure required fields, including role from the request body.
//     const { username, email, password, address, phone, dateOfBirth, role } = req.body;

//     // Validate required fields.
//     if (!username || !email || !password || !phone) {
//       return res.status(400).json({ message: "Username, email, password, and phone are required." });
//     }

//     // Validate email format.
//     if (!validator.isEmail(email)) {
//       return res.status(400).json({ message: "Invalid email format." });
//     }

//     // Validate phone number.
//     if (!validator.isMobilePhone(phone, "any", { strictMode: false })) {
//       return res.status(400).json({ message: "Invalid phone number." });
//     }

//     // Validate username length.
//     if (username.length < 4) {
//       return res.status(400).json({ message: "Username must be at least 4 characters long." });
//     }

//     // Check if a user with the same username or email already exists.
//     const existingUser = await User.findOne({ $or: [{ username }, { email }] });
//     if (existingUser) {
//       return res.status(400).json({ message: "Username or email already exists." });
//     }

//     // Validate password length.
//     if (password.length < 6) {
//       return res.status(400).json({ message: "Password must be at least 6 characters long." });
//     }

//     // Validate phone number length.
//     if (phone.length < 10) {
//       return res.status(400).json({ message: "Phone number must be at least 10 digits long." });
//     }

//     // Determine the user's role:
//     // - If no role is provided, default to "user".
//     // - Otherwise, convert to lowercase and validate it is either "admin" or "user".
//     let userRole = role ? role.toLowerCase() : "user";
//     if (userRole !== "admin" && userRole !== "user") {
//       return res.status(400).json({ message: "Role must be either 'admin' or 'user'." });
//     }

//     // Hash the user's password.
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new user with the provided role.
//     const newUser = new User({
//       username,
//       email,
//       password: hashedPassword,
//       address,
//       phone,
//       dateOfBirth,
//       role: userRole,
//     });
//     await newUser.save();

//     // Fetch a default subscription plan.
//     const defaultPlan = await SubscriptionPlan.findById("679d0f8785aadfd7e3ab97d8");
//     if (!defaultPlan) {
//       return res.status(500).json({ message: "No subscription plan found." });
//     }

//     // Create a subscription for the user.
//     const newSubscription = new Subscription({
//       userId: newUser._id,
//       planId: defaultPlan._id,
//       subscriptionDate: new Date(),
//     });
//     await newSubscription.save();

//     return res.status(201).json({
//       message: "Signup successful and subscription created.",
//       userId: newUser._id,
//       subscriptionId: newSubscription._id,
//     });
//   } catch (error) {
//     console.error("Error during signup:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// exports.signIn = async (req, res) => {
//   try {
//     const { username, password, RememberMe } = req.body;

//     // Validate user credentials
//     const user = await User.findOne({ username });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "30d" }  // Set token expiration to 30 days
//     );

//     // Set cookie options
//     const cookieOptions = {
//       httpOnly: true,  // Prevents access to the cookie via JavaScript
//       secure: process.env.NODE_ENV === "production",  // Ensure this is set to true in production (HTTPS only)
//       sameSite: "strict",  // Protects from CSRF attacks
//     };

//     // If RememberMe is checked, set maxAge for 7 days
//     if (RememberMe) {
//       cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000;  // 7 days
//     }

//     // Send token as a cookie
//     res.cookie("token", token, cookieOptions);

//     // Respond with success message and user info (without the password)
//     res.status(200).json({
//       id: user._id,
//       role: user.role,
//       message: "Sign in successful",
//     });
//   } catch (error) {
//     console.error("Error during sign in:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // exports.logout = (req, res) => {
// //   res.clearCookie("token"); // Clear the cookie
// //   res.status(200).json({ message: "Logged out successfully" });
// // };

// // Other user-related functions (signup, getUserInfo, etc.) can be defined here.

// exports.logout = (req, res) => {
//   res.clearCookie("token"); // حذف الكوكيز
//   res.status(200).json({ message: "Logged out successfully" });
// };


// // // Get User Info (from token)
// // exports.getUserInfo = async (req, res) => {
// //   // Retrieve the token from cookies (or headers if you prefer)
// //   const token = req.cookies.token;

// //   if (!token) {
// //     return res.status(401).json({ message: "No token provided" });
// //   }

// //   // Use the JWT_SECRET constant for verification
// //   jwt.verify(token, JWT_SECRET, (err, decoded) => {
// //     if (err) {
// //       return res.status(403).json({ message: "Invalid or expired token" });
// //     }

// //     // If token is valid, fetch user data (exclude the password)
// //     User.findById(decoded.id)
// //       .select("-password")
// //       .then(user => {
// //         if (!user) {
// //           return res.status(404).json({ message: "User not found" });
// //         }
// //         res.json(user); // Send user info
// //       })
// //       .catch(error => res.status(500).json({ message: "Error fetching user info" }));
// //   });
// // };
// exports.getUserInfo = async (req, res) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     jwt.verify(token, JWT_SECRET, async (err, decoded) => {
//       if (err) {
//         return res.status(403).json({ message: "Invalid or expired token" });
//       }

//       // Fetch user details (excluding password)
//       const user = await User.findById(decoded.id).select("-password");

//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       // Fetch subscription details for the user and populate the plan info
//       const subscription = await Subscription.findOne({ userId: user._id }).populate("planId", "name Duration price");

//       // Construct response with user & subscription details
//       const userInfo = {
//         ...user.toObject(),
//         subscription: subscription
//           ? {
//             subscriptionId: subscription._id,
//             planId: subscription.planId._id,
//             planName: subscription.planId.name,
//             duration: subscription.planId.Duration,
//             price: subscription.planId.price,
//             subscriptionDate: subscription.subscriptionDate,
//             renewalDate: subscription.renewalDate,
//           }
//           : null, // If user has no subscription, return null
//       };

//       res.json(userInfo);
//     });
//   } catch (error) {
//     console.error("Error fetching user info:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // // Update User Info
// // exports.UpdateUserInfo = async (req, res) => {
// //   try {
// //     // Assuming req.user is populated by an authentication middleware
// //     const { id } = req.user;
// //     const updateData = {};
// //     const allowedFields = ["username", "email", "address", "phone", "dateOfBirth", "image"];
// //     allowedFields.forEach(field => {
// //       if (req.body[field] !== undefined) {
// //         updateData[field] = req.body[field];
// //       }
// //     });

// //     if (Object.keys(updateData).length === 0) {
// //       return res.status(400).json({ message: "No data provided for update." });
// //     }

// //     if (updateData.username && updateData.username.length < 4) {
// //       return res.status(400).json({ message: "Username must be at least 4 characters long." });
// //     }

// //     if (updateData.email) {
// //       const emailExists = await User.findOne({ email: updateData.email });
// //       if (emailExists && emailExists._id.toString() !== id) {
// //         return res.status(400).json({ message: "Email already exists." });
// //       }
// //     }

// //     const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
// //     res.status(200).json({ message: "Profile updated successfully.", updatedUser });
// //   } catch (error) {
// //     console.error("Error updating profile:", error);
// //     res.status(500).json({ message: "Internal server error." });
// //   }
// // };

// // Update User Info and Subscription Plan
// exports.UpdateUserInfo = async (req, res) => {
//   try {
//     // Assuming req.user is set by your authentication middleware
//     const { id } = req.user;
//     const updateData = {};
//     const allowedFields = ["username", "email", "address", "phone", "dateOfBirth", "image"];

//     allowedFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         updateData[field] = req.body[field];
//       }
//     });

//     // If no data to update and no planId provided, return error
//     if (Object.keys(updateData).length === 0 && !req.body.planId) {
//       return res.status(400).json({ message: "No data provided for update." });
//     }

//     if (updateData.username && updateData.username.length < 4) {
//       return res.status(400).json({ message: "Username must be at least 4 characters long." });
//     }

//     // Check email uniqueness even though email is not editable (this is extra protection)
//     if (updateData.email) {
//       const emailExists = await User.findOne({ email: updateData.email });
//       if (emailExists && emailExists._id.toString() !== id) {
//         return res.status(400).json({ message: "Email already exists." });
//       }
//     }

//     // Update user info
//     const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

//     // Check if subscription update is requested
//     if (req.body.planId) {
//       const planId = req.body.planId;
//       // Validate planId format
//       if (!mongoose.Types.ObjectId.isValid(planId)) {
//         return res.status(400).json({ message: "Invalid plan ID format." });
//       }

//       // Check if the user already has a subscription
//       let subscription = await Subscription.findOne({ userId: id });

//       if (subscription) {
//         // Update the subscription with the new planId and reset the subscriptionDate (renewalDate will be recalculated by pre-save hook)
//         subscription.planId = planId;
//         subscription.subscriptionDate = new Date();
//         await subscription.save();
//       } else {
//         // Create a new subscription for the user
//         subscription = new Subscription({
//           userId: id,
//           planId,
//           subscriptionDate: new Date()
//         });
//         await subscription.save();
//       }
//     }

//     res.status(200).json({ message: "Profile updated successfully.", updatedUser });
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };
require("dotenv").config();
const Subscription = require("../models/subscription");
const SubscriptionPlan = require("../models/subscriptionplan");
const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const crypto = require("crypto");
const { isValidObjectId } = require("mongoose");
const { generateOtp, mailTransport, GeneratePasswordResetTemplate } = require("../utils/mail");
const VerifyToken = require("../models/verificationtokens");
const ResetToken = require("../models/resetToken");

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Utility function for sending errors
const sendError = (res, message, status = 400) => {
  return res.status(status).json({ success: false, error: message });
};

// -------------------
// Signup Controller
// -------------------
exports.signup = async (req, res) => {
  try {
    const { username, email, password, address, phone, dateOfBirth } = req.body;
    if (!username || !email || !password || !phone) {
      return res.status(400).json({ message: "Username, email, password, and phone are required." });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, address, phone, dateOfBirth });

    // Generate OTP for email verification
    const OTP = generateOtp();
    const verificationToken = new VerifyToken({ owner: newUser._id, token: OTP });

    await verificationToken.save();
    await newUser.save();

    // Send email with OTP
    mailTransport().sendMail({
      from: "emailverification@email.com",
      to: newUser.email,
      subject: "Verify your Email please!",
      html: `<h1>${OTP}</h1>`
    });

    return res.status(201).json({ message: "Signup successful.", userId: newUser._id });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// -------------------
// Signin Controller
// -------------------
exports.signin = async (req, res) => {
  try {
    const { username, password, RememberMe } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "30d" });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    if (RememberMe) {
      cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    }

    res.cookie("token", token, cookieOptions);
    res.status(200).json({
      id: user._id,
      role: user.role,
      message: "Sign in successful",
    });
  } catch (error) {
    console.error("Error during sign in:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// -------------------
// Get User Info Controller
// -------------------
exports.getUserInfo = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // (Optional) Fetch subscription details here if needed

      res.json(user);
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
    const allowedFields = ["username", "email", "address", "phone", "dateOfBirth", "image"];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0 && !req.body.planId) {
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
          subscriptionDate: new Date()
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
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
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
  const resetUrl = `http://localhost:5173/reset-password?token=${randomBytes}&id=${user._id}`;

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

    user.password = password.trim();
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

exports.verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp.trim()) {
      return sendError(res, "Invalid request, missing parameters");
    }

    if (!isValidObjectId(userId)) {
      return sendError(res, "Invalid user ID");
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, "Sorry, user not found!");
    }

    if (user.verified) {
      return sendError(res, "This email is already verified");
    }

    const token = await VerifyToken.findOne({ owner: user._id });
    if (!token) {
      return sendError(res, "Verification token not found!");
    }

    // Verify the OTP using the compareToken method on the token document
    const isMatched = await token.compareToken(otp);
    if (!isMatched) {
      return sendError(res, "Please provide a valid token!");
    }

    user.verified = true;
    await user.save();

    await VerifyToken.findByIdAndDelete(token._id);

    await mailTransport().sendMail({
      from: "emailverification@email.com",
      to: user.email,
      subject: "Congrats!",
      html: "<h1>Email verification successful, thanks for connecting with us!</h1>"
    });

    return res.status(200).json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};