const User = require("../models/users");
const mongoose = require('mongoose');

exports.addToWishlist = async (req, res) => {
  try {
    const { userId, bookId } = req.body;
  
    // Validate input
    if (!userId || !bookId) {
      return res.status(400).json({ message: "Missing required fields: userId or bookId" });
    }
  
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
  
    // Find the user.
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    // Check if the book is already in the wishlist.
    if (user.wishlist.includes(bookId)) {
      return res.status(400).json({ message: "This book is already in the user's wishlist" });
    }
  
    // Add the book to the wishlist.
    user.wishlist.push(bookId);
    await user.save();
  
    return res.status(201).json({
      message: "Book added to wishlist successfully",
      wishlist: user.wishlist, // Return the updated wishlist array
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while adding book to wishlist",
      error: error.message,
    });
  }
};
//get wishlist books
exports.getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find the user and populate the wishlist field with Book details.
    const user = await User.findById(userId).populate('wishlist');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optionally, map the wishlist array to extract only the fields you need.
    // For example, if you want only _id, title, and image:
    const detailedWishlist = user.wishlist.map((book) => ({
      _id: book._id.toString(),
      title: book.title,
      image: book.image,
      description: book.description
    }));

    return res.status(200).json(detailedWishlist);
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching user's wishlist",
      error: error.message,
    });
  }
};
//delete books from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    // Expecting userId and bookId to be provided as URL parameters.
    const { userId, bookId } = req.params;
  
    // Validate the IDs.
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
  
    // Find the user.
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    // Remove the book from the wishlist.
    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter((id) => id.toString() !== bookId);
  
    if (user.wishlist.length === initialLength) {
      return res.status(404).json({ message: "Book not found in wishlist" });
    }
  
    await user.save();
  
    return res.status(200).json({
      message: "Book removed from wishlist",
      wishlist: user.wishlist, // Return the updated wishlist array
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while removing book from wishlist",
      error: error.message,
    });
  }
};
