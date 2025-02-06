const User = require("../models/users");
const mongoose = require('mongoose');
const Book = require("../models/books");

exports.addToWishlist = async (req, res) => {
  try {
    const { userId, bookId, state } = req.body;
  
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
    const exists = user.wishlist.some(item => item.book.toString() === bookId);
    if (exists) {
      return res.status(400).json({ message: "This book is already in the user's wishlist" });
    }
  
    // Add the book to the wishlist with its state.
    user.wishlist.push({ 
      book: bookId, 
      state: state || "Want to read" // use provided state or default to "Want to read"
    });
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
exports.getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find the user and populate the wishlist.book field with Book details.
    const user = await User.findById(userId)
      .populate('wishlist.book', 'title image description') // Populate the 'book' field
      .exec();

    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // // Ensure wishlist exists and is an array
    // if (!user.wishlist || !Array.isArray(user.wishlist)) {
    //   return res.status(200).json([]);
    // }

    // console.log("Populated Wishlist:", user.wishlist);

    // // Map the wishlist array to return desired fields from the populated Book document plus state.
    // const detailedWishlist = user.wishlist.map(item => {
    //   // Check if the book was successfully populated.
    //   if (!item.book) {
    //     console.log("Book not populated for wishlist item:", item);
    //     return null;
    //   }

    //   return {
    //     book_id: item.book._id.toString(),  // Book's _id field is stable
    //     title: item.book.title,
    //     image: item.book.image,
    //     description: item.book.description,
    //     state: item.state,  // Use the wishlist item's state
    //   };
    // }).filter(item => item !== null); // Remove any null entries

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user's wishlist:", error);
    return res.status(500).json({
      message: "Server error while fetching user's wishlist",
      error: error.message || "Unknown error",
    });
  }
};




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
    user.wishlist = user.wishlist.filter(item => item.book.toString() !== bookId);
  
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
