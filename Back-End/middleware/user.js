// const User = require('../models/users')
// const { isValidObjectId } = require("mongoose");
// const RestToken = require('../models/resetToken');

// const sendError = (res, message, status = 401) => {
//     return res.status(status).json({ success: false, error: message });
// };


// const isResetTokenValid = async (req, res, next) => {
//     const { token, id } = req.query;
//     if(!token || !id) return sendError(res , "Invalid Request!");
//     if(!isValidObjectId(id)) return sendError(res , "invalid user!");

//    const user= await User.findById(id);
//    if(!user) return sendError(res , "user not found!");
//   const restToken =await RestToken.findOne({owner:user._id});
//   if(!restToken) return sendError(res , "Reset Token not found!");

//   const isValid = await restToken.compareToken(token);
//   if(!isValid) return sendError(res , "Reset Token is not invalid!");
//    req.user = user;
//    next();

// }
// module.exports = { isResetTokenValid };


const { isValidObjectId } = require("mongoose");
const User = require("../models/users");
const ResetToken = require("../models/resetToken");

const sendError = (res, message, status = 401) => {
    return res.status(status).json({ success: false, error: message });
};

const isResetTokenValid = async (req, res, next) => {
    const { token, id } = req.query;  // Fixed spelling error

    if (!token || !id) return sendError(res, "Invalid Request!");
    if (!isValidObjectId(id)) return sendError(res, "Invalid user!");

    const user = await User.findById(id);
    if (!user) return sendError(res, "User not found!");

    const resetToken = await ResetToken.findOne({ owner: user._id });
    if (!resetToken) return sendError(res, "Reset Token not found!");

    const isValid = await resetToken.compareToken(token);
    if (!isValid) return sendError(res, "Reset Token is invalid!");

    req.user = user;
        console.log("Received ID:", id);
    console.log("Received Token:", token);
    next();
};

module.exports = { isResetTokenValid };
