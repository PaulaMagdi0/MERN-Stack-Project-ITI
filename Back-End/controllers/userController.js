const User = require("../models/users");
const mongoose = require("mongoose");
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
  
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
  
        const user = await User.findById(id);
  
        if (!user) return res.status(404).json({ message: "User not found" });
  
        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
  };
  
  // Add a book to the user's wishlist
  exports.addBookToWishlist = async (req, res) => {
    try {
        const { userId, bookId } = req.body;
  
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ message: "Invalid ID(s)" });
        }
  
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
  
        // Add the book if not already in wishlist
        if (!user.wishlist.includes(bookId)) {
            user.wishlist.push(bookId);
            await user.save();
        }
        res.json({ message: "Book added to wishlist", wishlist: user.wishlist });
    } catch (error) {
        console.error("Error adding book to wishlist:", error);
        res.status(500).json({ message: "Server error" });
    }
  };
  
  // Remove a book from the user's wishlist
  exports.removeBookFromWishlist = async (req, res) => {
    try {
        const { userId, bookId } = req.body;
  
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ message: "Invalid ID(s)" });
        }
  
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
  
        // Remove the book from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== bookId);
        await user.save();
        res.json({ message: "Book removed from wishlist", wishlist: user.wishlist });
    } catch (error) {
        console.error("Error removing book from wishlist:", error);
        res.status(500).json({ message: "Server error" });
    }
  };
  