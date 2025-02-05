  const Wishlist = require("../models/whishlist");


// POST: Add a book to wishlistexports.addToWishlist = async (req, res) => {


  exports.addToWishlist = async (req, res) => {
    try {
      const { userId, bookId } = req.body;
  
      // Check if the entry already exists
      const existingEntry = await Wishlist.findOne({ user_id: userId, book_id: bookId });
      if (existingEntry) {
        return res.status(400).json({
          message: "This book is already in the user's wishlist",
        });
      }
  
      // Create and save the new entry
      const wishlistEntry = new Wishlist({ user_id: userId, book_id: bookId });
      const savedEntry = await wishlistEntry.save();
  
      return res.status(201).json({
        message: "Book added to wishlist successfully",
        data: savedEntry,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          message: "This book is already in the user's wishlist",
        });
      }
      return res.status(500).json({
        message: "Server error while adding book to wishlist",
        error: error.message,
      });
    }
  };

// GET: Get all wishlist items for a user
exports.getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const wishlist = await Wishlist.find({ user: userId })
      .populate("book") // If you want to load the book data
      .populate("user", "username email"); // If you also want user data

    return res.status(200).json(wishlist);
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching user's wishlist",
      error: error.message,
    });
  }
};

// DELETE: Remove a book from wishlist (by wishlist item ID)
exports.removeFromWishlist = async (req, res) => {
  try {
    const { wishlistItemId } = req.params;

    const deletedEntry = await Wishlist.findByIdAndDelete(wishlistItemId);
    if (!deletedEntry) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    return res.status(200).json({
      message: "Book removed from wishlist",
      data: deletedEntry,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while removing book from wishlist",
      error: error.message,
    });
  }
};
