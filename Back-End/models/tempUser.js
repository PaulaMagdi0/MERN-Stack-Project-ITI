// models/tempUser.js
const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: String,
    phone: {
        type: String,
        required: true,
    },
    dateOfBirth: Date,
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('TempUser', tempUserSchema);