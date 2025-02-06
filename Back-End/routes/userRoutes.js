const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const { authenticationToken } = require("../middleware/authMiddleware");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const nodemailer = require('nodemailer');
const { generateOtp , mailTransport} = require("../utils/mail");
const VerifyToken = require("../models/verificationtokens")


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Rate limiting for signup and signin
const signupSigninLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});

// Signup Route
router.post("/sign-up", signupSigninLimiter, async (req, res) => {
    try {
        const { username, email, password, address, phone, dateOfBirth } = req.body;    

        if (!username || !email || !password || !phone) {
            return res.status(400).json({ message: "Username, email, password, and phone are required." });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        // Validate phone number (at least 10 digits)
        if (!validator.isMobilePhone(phone, "any", { strictMode: false })) {
            return res.status(400).json({ message: "Invalid phone number." });
        }

        if (username.length < 4) {
            return res.status(400).json({ message: "Username must be at least 4 characters long." });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        if (phone.length < 10) {
            return res.status(400).json({ message: "Phone number must be at least 10 digits long." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = email === "admin@gmail.com" ? "admin" : "user";

        const newUser = new User({ username, email, password: hashedPassword, address, phone, dateOfBirth, role });

        const OTP = generateOtp();
       const verfivicationToken = new VerifyToken({
            owner:newUser._id,
            token:OTP
        })

        await verfivicationToken.save();
        await newUser.save();

        mailTransport().sendMail({
            from:"emailverification@email.com",
            to: newUser.email,
            subject:"Verify your Email please!",
            html :`<h1>${OTP}</h1>`
        })

        return res.status(201).json({ message: "Signup successful." });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Signin Route
router.post("/sign-in", signupSigninLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
        res.status(200).json({ id: user._id, role: user.role, token });
    } catch (error) {
        console.error("Error during signin:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Get User Info
router.get("/get-user-info", authenticationToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


// Update Profile
router.put("/update-profile", authenticationToken, async (req, res) => {
    try {
        const { id } = req.user;
        const updateData = {};
        const allowedFields = ["username", "email", "address", "phone", "dateOfBirth", "image"];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (Object.keys(updateData).length === 0) {
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
        res.status(200).json({ message: "Profile updated successfully.", updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


// Validate Token Route
router.post("/validate-token", authenticationToken, (req, res) => {
    res.status(200).json({ valid: true, message: "Token is valid." });
});




// router.post("/forgot-password", async (req, res) => {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
  
//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }
  
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
//     user.resetToken = token;
//     user.resetTokenExpires = Date.now() + 3600000; // 1 ساعة
//     await user.save();
  
//     // إرسال الإيميل
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL, 
//         pass: process.env.EMAIL_PASSWORD 
//     },
//     tls: {
//         rejectUnauthorized: false
//     }    });
  
//     const resetLink = `http://localhost:3000/reset-password/${token}`;
  
//     await transporter.sendMail({
//       from: process.env.EMAIL,
//       to: user.email,
//       subject: "Password Reset Request",
//       html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
//     });
  
//     res.json({ message: "Password reset link sent to your email" });
//   });
  
//   //  إعادة تعيين كلمة المرور
//   router.post("/reset-password", async (req, res) => {
//     const { token, password } = req.body;
  
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.id);
  
//       if (!user || user.resetToken !== token || user.resetTokenExpires < Date.now()) {
//         return res.status(400).json({ message: "Invalid or expired token" });
//       }
  
//       const hashedPassword = await bcrypt.hash(password, 10);
//       user.password = hashedPassword;
//       user.resetToken = undefined;
//       user.resetTokenExpires = undefined;
//       await user.save();
  
//       res.json({ message: "Password reset successfully" });
//     } catch (error) {
//       res.status(400).json({ message: "Invalid token" });
//     }
//   });
  

module.exports = router;
