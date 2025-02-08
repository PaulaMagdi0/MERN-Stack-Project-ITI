const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const { authenticationToken } = require("../middleware/authMiddleware");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const nodemailer = require('nodemailer');
const { generateOtp , mailTransport , GeneratePasswordResetTemplate} = require("../utils/mail");
const VerifyToken = require("../models/verificationtokens");
const ResetToken = require("../models/resetToken");
const crypto =require('crypto')
const { isValidObjectId } = require("mongoose");
const { resolve } = require("path");
const { rejects } = require("assert");
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const RestToken = require("../models/resetToken");
const { isResetTokenValid } = require("../middleware/user");



// Rate limiting for signup and signin
const signupSigninLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});

// Signup Route
// router.post("/sign-up", signupSigninLimiter, async (req, res) => {
//     try {
//         const { username, email, password, address, phone, dateOfBirth } = req.body;    

//         if (!username || !email || !password || !phone) {
//             return res.status(400).json({ message: "Username, email, password, and phone are required." });
//         }

//         if (!validator.isEmail(email)) {
//             return res.status(400).json({ message: "Invalid email format." });
//         }

//         // Validate phone number (at least 10 digits)
//         if (!validator.isMobilePhone(phone, "any", { strictMode: false })) {
//             return res.status(400).json({ message: "Invalid phone number." });
//         }

//         if (username.length < 4) {
//             return res.status(400).json({ message: "Username must be at least 4 characters long." });
//         }

//         // Check if username or email already exists
//         const existingUser = await User.findOne({ $or: [{ username }, { email }] });
//         if (existingUser) {
//             return res.status(400).json({ message: "Username or email already exists." });
//         }

//         if (password.length < 6) {
//             return res.status(400).json({ message: "Password must be at least 6 characters long." });
//         }

//         if (phone.length < 10) {
//             return res.status(400).json({ message: "Phone number must be at least 10 digits long." });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const role = email === "admin@gmail.com" ? "admin" : "user";

//         const newUser = new User({ username, email, password: hashedPassword, address, phone, dateOfBirth, role });

//         const OTP = generateOtp();
//        const verfivicationToken = new VerifyToken({
//             owner:newUser._id,
//             token:OTP
//         })

//         await verfivicationToken.save();
//         await newUser.save();

//         mailTransport().sendMail({
//             from:"emailverification@email.com",
//             to: newUser.email,
//             subject:"Verify your Email please!",
//             html :`<h1>${OTP}</h1>`
//         })

//         return res.status(201).json({ message: "Signup successful." });
//     } catch (error) {
//         console.error("Error during signup:", error);
//         res.status(500).json({ message: "Internal server error." });
//     }
// });

router.post("/sign-up", signupSigninLimiter, async (req, res) => {
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

        const OTP = generateOtp();
        const verificationToken = new VerifyToken({ owner: newUser._id, token: OTP });

        await verificationToken.save();
        await newUser.save();

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

const sendError = (res, message, status = 401) => {
    return res.status(status).json({ success: false, error: message });
};
router.post("/verify-email", async (req, res) => {
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

        // التحقق من مطابقة الـ OTP
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
            html: `<h1>Email verification successful, thanks for connecting with us!</h1>`
        });

        // إرجاع الاستجابة النهائية
        return res.status(200).json({ success: true, message: "Email verified successfully!" });

    } catch (error) {
        console.error("Error verifying email:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

//Forget password 
creatRandomBytes =()=>new Promise((resolve , reject)=>{
    crypto.randomBytes(30 , (err , buff)=>{
        if(err) reject(err);
        const token =buff.toString('hex');
        resolve(token);

    })

})
router.post("/forget-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return sendError(res, "Please provide a valid Email!");
    }

    const user = await User.findOne({ email });
    if (!user) return sendError(res, "User not found, Invalid request!");

    const existingToken = await ResetToken.findOne({ owner: user._id });
    if (existingToken) return sendError(res, "Only after one hour can you request another token!");

    const randomBytes = await creatRandomBytes();
    const resetToken = new ResetToken({ owner: user._id, token: randomBytes });

    await resetToken.save(); 

    await mailTransport().sendMail({
        from: "security@email.com",
        to: user.email,
        subject: "Password Reset",
        html: GeneratePasswordResetTemplate(`http://localhost:5173/reset-password?token=${randomBytes}&id=${user._id}`)
    });

    res.json({ success: true, message: "Password reset link is sent to your email." });
});

//Reset Password
router.post("/reset-password",isResetTokenValid , async (req, res) => {
    const{password}= req.body;
    const user = await User.findById(req.user._id);
    if(!user) return sendError(res , "user not found !");
    const isSamePass= await user.comparePassword(password);
    if(isSamePass) return sendError(res , "new password must be deffrent !");
    if(password.trim().length <8 || password.trim().length > 20)
        return sendError(res , "new password must be 8 to 20 char !");

    user.password = password.trim();
    await user.save();
    await RestToken.findOneAndDelete({ owner: user._id });


 
    await mailTransport().sendMail({
    from: "security@email.com",
    to: user.email,
    subject: "Password Reset sucessfully",
    html: `<h1>congrats password reset done !</h1>`
});

res.json({ success:true , message:"Password Reset Sucessfully "})


})


router.get("/verify-token", isResetTokenValid, async (req, res) => {
    res.json({success : true , })
}
)





















// router.post("/forgot-password", async (req, res) => {

//     const {userId ,otp }=req.body
//     if(!userId || !otp.trim()){
//         return sendError(res , "Invalid req , missing parameters")
//     }
//     if(isValidObjectId(userId)){
//         return sendError(res , "Invalid user id ")
//     }
//     const user = await User.findById(userId)
//     if(!user) return sendError(res , "sorry , user not found!")

//     if(user.verified) return sendError(res , "this is email already verfiyed ")
//  const token=   await VerifyToken.findOne({owner:user._id})
//     if(!token) return sendError(res , "sorry , user not found!");

//    const isMacted = await token.compareToken(otp);
//    if(!isMacted) return sendError(res , "please provied a valid token !");

//    user.verified= true;

//    await VerifyToken.findByIdAndDelete(token._id);
//    await user.save();

//    mailTransport().sendMail({
//     from:"emailverification@email.com",
//     to: user.email,
//     subject:"Verify your Email please!",
//     html :`<h1>Email Verification secussfully , thanks for connection with us</h1>`
// })}
// )



module.exports = router;
