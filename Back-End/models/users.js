const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
                const today = new Date();
                const minAge = 13;
                const birthDate = new Date(value);
                const age = today.getFullYear() - birthDate.getFullYear();
                return age >= minAge;
            },
            message: 'User must be at least 13 years old',
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

const User = mongoose.model('User', userSchema);
module.exports = User;



// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//     {
//         username: {
//             type: String,
//             required: [true, "Username is required"],
//             unique: true,
//             trim: true,
//         },
//         email: {
//             type: String,
//             required: [true, "Email is required"],
//             unique: true,
//             lowercase: true,
//             match: [
//                 /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
//                 "Please enter a valid email address",
//             ],
//         },
//         password: {
//             type: String,
//             required: [true, "Password is required"],
//             minlength: [6, "Password must be at least 6 characters"],
//             match: [
//                 /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
//                 "Password must contain at least one uppercase letter, one number, and one special character",
//             ],
//         },
//         address: {
//             type: String,
//             required: [true, "Address is required"],
//             trim: true,
//         },
//         phone: {
//             type: String,
//             required: [true, "Phone number is required"],
//             match: [
//                 /^(\+?\d{1,3}[- ]?)?\(?\d{2,3}\)?[- ]?\d{3}[- ]?\d{4}$/,
//                 "Please enter a valid phone number",
//             ],
//         },
//         dateOfBirth: {
//             type: Date,
//             required: [true, "Date of Birth is required"],
//             validate: {
//                 validator: function (value) {
//                     const today = new Date();
//                     const birthDate = new Date(value);
//                     let age = today.getFullYear() - birthDate.getFullYear();
                    
//                     // Check if the birthday has not occurred yet in this year
//                     const monthDiff = today.getMonth() - birthDate.getMonth();
//                     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//                         age--;
//                     }
                    
//                     return age >= 13;
//                 },
//                 message: "User must be at least 13 years old",
//             },
//         },
//         image: {
//             type: String,
//             default: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png",
//             required:flase
//         },
//         role: {
//             type: String,
//             enum: ["user", "admin"],
//             default: "user",
//         },
//     },
//     {
//         timestamps: true, // Automatically manages `createdAt` and `updatedAt`
//     }
// );

// const User = mongoose.model("User", userSchema);
// module.exports = User;
