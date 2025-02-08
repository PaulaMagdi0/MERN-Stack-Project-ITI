// models/review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "books",
  },
  reviewDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  comments: {
    type: String,
  },
  rate: {
    type: Number,
    required: true,
    default: 1,
  },
});

module.exports = mongoose.model('Review', reviewSchema);
