// controllers/userController.js

// Ensure that environment variables are loaded (this should already be done in your server.js,
// so you don't need to call it here if your entry point already does it).
// require("dotenv").config();
const Subscription = require("../models/subscription");
const SubscriptionPlan = require("../models/subscriptionplan");
const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// Use a single constant for the JWT secret throughout the controller.
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// User Signup
// exports.signUp = async (req, res) => {
//   try {
//     const { username, email, password, address, phone, dateOfBirth } = req.body;

//     // Check for missing fields
//     if (!username || !email || !password || !phone) {
//       return res.status(400).json({ message: "Username, email, password, and phone are required." });
//     }

//     // Validate email format
//     if (!validator.isEmail(email)) {
//       return res.status(400).json({ message: "Invalid email format." });
//     }

//     // Validate phone number (using a generic check; you may adjust as needed)
//     if (!validator.isMobilePhone(phone, "any", { strictMode: false })) {
//       return res.status(400).json({ message: "Invalid phone number." });
//     }

//     if (username.length < 4) {
//       return res.status(400).json({ message: "Username must be at least 4 characters long." });
//     }

//     // Check if username or email already exists
//     const existingUser = await User.findOne({ $or: [{ username }, { email }] });
//     if (existingUser) {
//       return res.status(400).json({ message: "Username or email already exists." });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ message: "Password must be at least 6 characters long." });
//     }

//     if (phone.length < 10) {
//       return res.status(400).json({ message: "Phone number must be at least 10 digits long." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const role = email === "admin@gmail.com" ? "admin" : "user";

//     const newUser = new User({ username, email, password: hashedPassword, address, phone, dateOfBirth, role });
//     await newUser.save();

//     return res.status(201).json({ message: "Signup successful." });
//   } catch (error) {
//     console.error("Error during signup:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

exports.signUp = async (req, res) => {
  try {
    // Destructure required fields, including role from the request body.
    const { username, email, password, address, phone, dateOfBirth, role } = req.body;

    // Validate required fields.
    if (!username || !email || !password || !phone) {
      return res.status(400).json({ message: "Username, email, password, and phone are required." });
    }

    // Validate email format.
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Validate phone number.
    if (!validator.isMobilePhone(phone, "any", { strictMode: false })) {
      return res.status(400).json({ message: "Invalid phone number." });
    }

    // Validate username length.
    if (username.length < 4) {
      return res.status(400).json({ message: "Username must be at least 4 characters long." });
    }

    // Check if a user with the same username or email already exists.
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    // Validate password length.
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Validate phone number length.
    if (phone.length < 10) {
      return res.status(400).json({ message: "Phone number must be at least 10 digits long." });
    }

    // Determine the user's role:
    // - If no role is provided, default to "user".
    // - Otherwise, convert to lowercase and validate it is either "admin" or "user".
    let userRole = role ? role.toLowerCase() : "user";
    if (userRole !== "admin" && userRole !== "user") {
      return res.status(400).json({ message: "Role must be either 'admin' or 'user'." });
    }

    // Hash the user's password.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the provided role.
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      address,
      phone,
      dateOfBirth,
      role: userRole,
    });
    await newUser.save();

    // Fetch a default subscription plan.
    const defaultPlan = await SubscriptionPlan.findById("679d0f8785aadfd7e3ab97d8");
    if (!defaultPlan) {
      return res.status(500).json({ message: "No subscription plan found." });
    }

    // Create a subscription for the user.
    const newSubscription = new Subscription({
      userId: newUser._id,
      planId: defaultPlan._id,
      subscriptionDate: new Date(),
    });
    await newSubscription.save();

    return res.status(201).json({
      message: "Signup successful and subscription created.",
      userId: newUser._id,
      subscriptionId: newSubscription._id,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// User Signin
exports.signIn = async (req, res) => {
  try {
    const { username, password, RememberMe } = req.body;

    // Validate input (you can add more detailed validation if needed)
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a token with the constant JWT_SECRET
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Set a persistent cookie if RememberMe is true; otherwise, a session cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    if (RememberMe) {
      cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    }

    res.cookie("token", token, cookieOptions);

    // Optionally, also send back token details (without the password)
    res.status(200).json({
      id: user._id,
      role: user.role,
      message: "Sign in successful",
    });
  } catch (error) {
    console.error("Error during sign in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token"); // حذف الكوكيز
  res.status(200).json({ message: "Logged out successfully" });
};


// // Get User Info (from token)
// exports.getUserInfo = async (req, res) => {
//   // Retrieve the token from cookies (or headers if you prefer)
//   const token = req.cookies.token;

//   if (!token) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   // Use the JWT_SECRET constant for verification
//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ message: "Invalid or expired token" });
//     }

//     // If token is valid, fetch user data (exclude the password)
//     User.findById(decoded.id)
//       .select("-password")
//       .then(user => {
//         if (!user) {
//           return res.status(404).json({ message: "User not found" });
//         }
//         res.json(user); // Send user info
//       })
//       .catch(error => res.status(500).json({ message: "Error fetching user info" }));
//   });
// };
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

      // Fetch user details (excluding password)
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Fetch subscription details for the user and populate the plan info
      const subscription = await Subscription.findOne({ userId: user._id }).populate("planId", "name Duration price");

      // Construct response with user & subscription details
      const userInfo = {
        ...user.toObject(),
        subscription: subscription
          ? {
            subscriptionId: subscription._id,
            planId: subscription.planId._id,
            planName: subscription.planId.name,
            duration: subscription.planId.Duration,
            price: subscription.planId.price,
            subscriptionDate: subscription.subscriptionDate,
            renewalDate: subscription.renewalDate,
          }
          : null, // If user has no subscription, return null
      };

      res.json(userInfo);
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// // Update User Info
// exports.UpdateUserInfo = async (req, res) => {
//   try {
//     // Assuming req.user is populated by an authentication middleware
//     const { id } = req.user;
//     const updateData = {};
//     const allowedFields = ["username", "email", "address", "phone", "dateOfBirth", "image"];
//     allowedFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         updateData[field] = req.body[field];
//       }
//     });

//     if (Object.keys(updateData).length === 0) {
//       return res.status(400).json({ message: "No data provided for update." });
//     }

//     if (updateData.username && updateData.username.length < 4) {
//       return res.status(400).json({ message: "Username must be at least 4 characters long." });
//     }

//     if (updateData.email) {
//       const emailExists = await User.findOne({ email: updateData.email });
//       if (emailExists && emailExists._id.toString() !== id) {
//         return res.status(400).json({ message: "Email already exists." });
//       }
//     }

//     const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
//     res.status(200).json({ message: "Profile updated successfully.", updatedUser });
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// Update User Info and Subscription Plan
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

    // If no data to update and no planId provided, return error
    if (Object.keys(updateData).length === 0 && !req.body.planId) {
      return res.status(400).json({ message: "No data provided for update." });
    }

    if (updateData.username && updateData.username.length < 4) {
      return res.status(400).json({ message: "Username must be at least 4 characters long." });
    }

    // Check email uniqueness even though email is not editable (this is extra protection)
    if (updateData.email) {
      const emailExists = await User.findOne({ email: updateData.email });
      if (emailExists && emailExists._id.toString() !== id) {
        return res.status(400).json({ message: "Email already exists." });
      }
    }

    // Update user info
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    // Check if subscription update is requested
    if (req.body.planId) {
      const planId = req.body.planId;
      // Validate planId format
      if (!mongoose.Types.ObjectId.isValid(planId)) {
        return res.status(400).json({ message: "Invalid plan ID format." });
      }

      // Check if the user already has a subscription
      let subscription = await Subscription.findOne({ userId: id });

      if (subscription) {
        // Update the subscription with the new planId and reset the subscriptionDate (renewalDate will be recalculated by pre-save hook)
        subscription.planId = planId;
        subscription.subscriptionDate = new Date();
        await subscription.save();
      } else {
        // Create a new subscription for the user
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
