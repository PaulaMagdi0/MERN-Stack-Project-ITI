// controllers/wishlistcontroller.js
const User = require("../models/users");
const mongoose = require('mongoose');

// Add a book to the wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { userId, bookId, state } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({ message: "Missing required fields: userId or bookId" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the book is already in the wishlist
    const exists = user.wishlist.some(item => item.book.toString() === bookId);
    if (exists) {
      return res.status(400).json({ message: "This book is already in the user's wishlist" });
    }

    // Add to wishlist with state (default "Want to read")
    user.wishlist.push({
      book: bookId,
      state: state || "Want to read"
    });
    await user.save();

    return res.status(201).json({ message: "Book added to wishlist successfully", wishlist: user.wishlist });
  } catch (error) {
    return res.status(500).json({ message: "Server error while adding book to wishlist", error: error.message });
  }
};

// Get user's wishlist
exports.getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(userId)
      .populate('wishlist.book', 'title image description')
      .exec();

    if (!user || !user.wishlist) {
      return res.status(200).json([]); // Return empty array if no wishlist
    }

    return res.status(200).json(user.wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({ message: "Server error while fetching wishlist", error: error.message });
  }
};

// Update wishlist item state
exports.updateWishlistState = async (req, res) => {
  try {
    const { userId, bookId, state } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const wishlistItem = user.wishlist.find(item => item.book.toString() === bookId);
    if (!wishlistItem) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    wishlistItem.state = state;
    await user.save();
    return res.status(200).json({ message: "Wishlist state updated", state: wishlistItem.state });
  } catch (error) {
    return res.status(500).json({ message: "Error updating wishlist state", error: error.message });
  }
};

// Remove a book from the wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { userId, bookId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter(item => item.book.toString() !== bookId);
    if (user.wishlist.length === initialLength) {
      return res.status(404).json({ message: "Book not found in wishlist" });
    }

    await user.save();
    return res.status(200).json({ message: "Book removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    return res.status(500).json({ message: "Server error while removing book from wishlist", error: error.message });
  }
};
