const mongoose = require("mongoose");
const user = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address'], // Email regex validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        match: [/^(\+?\d{1,3}[- ]?)?\(?\d{2,3}\)?[- ]?\d{3}[- ]?\d{4}$/, 'Please enter a valid phone number']
    },
    dateOfBirth: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value <= Date.now();
            },
            message: 'Date of birth cannot be in the future',
        },
    },
    image: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin"]
    }
}, { timestamps: true });

const User = mongoose.model('User', user);
module.exports = User;