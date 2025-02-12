const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { isResetTokenValid } = require('../middleware/user');
const {
  signup,
  signin,
  getUserInfo,
  UpdateUserInfo,
  logout,
  verifyEmail,
  forgetPassword,
  resetPassword,
  resendOTP
} = require('../controllers/userController');
const bcrypt = require("bcrypt");


// Rate limiting for signup and signin
const signupSigninLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Signup Route
router.post("/sign-up", signupSigninLimiter, signup);

// Signin Route
router.post("/sign-in", signupSigninLimiter, signin);

// // Get User Info (protected)
router.get("/get-user-info", authenticateToken, getUserInfo);


// // Validate Token (if needed)
router.post("/validate-token", authenticateToken, (req, res) => {
  res.status(200).json({ valid: true, message: "Token is valid." });
});

router.post('/resend-otp', resendOTP);

// // Verify Email
router.post("/verify-email", verifyEmail);

// // Update Profile (protected)
router.put("/update-profile", authenticateToken, UpdateUserInfo);

// // Forget Password
router.post("/forget-password", forgetPassword);

// // Reset Password (protected + token validation)
router.post("/reset-password", isResetTokenValid, resetPassword);
// // Reset Password (protected + token validation)

router.post("/logout", logout);

router.get("/verify-token", isResetTokenValid, async (req, res) => {
  res.json({ success: true, })
}
)
module.exports = router;


















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