const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (optional)
    required: true,
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book', // Reference to the Book model (optional)
    required: true,
  },
});

// Add a unique compound index to enforce uniqueness
wishlistSchema.index({ user_id: 1, book_id: 1 }, { unique: true });

// Compile the model
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// Export the model
module.exports = Wishlist;