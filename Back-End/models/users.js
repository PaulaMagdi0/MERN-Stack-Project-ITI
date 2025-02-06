// models/User.js
const mongoose = require('mongoose');

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
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address'],
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
  },
  // New wishlist field: an array of Book IDs
  wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
