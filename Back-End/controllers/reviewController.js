const Comment = require("../models/review");
const Book = require("../models/books");

exports.addComment = async (req, res) => {
  try {
    // console.log("Decoded User:", req.user); // Debugging to check if req.user exists
    const { comment,userId } = req.body;
    console.log("🚀 ~ exports.addComment= ~ userId:", userId)
    console.log("🚀 ~ exports.addComment= ~ comment:", comment)
    const { bookId } = req.params;
    // const userId = req.user?.id; // Extract userId from the decoded token

    if (!comment) {
      return res.status(400).json({ message: "Comment is required." });
    }

    if (comment.length < 5) {
      return res.status(400).json({ message: "Comment must be at least 5 characters long." });
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found." });

    // Create & save comment
    const newComment = new Comment({ user: userId, book: bookId, comment });
    await newComment.save();

    res.status(201).json({ message: "Comment added successfully", newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid input." });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getCommentsByBook = async (req, res) => {
  try {
    console.log("Decoded User from getComments:", req.user); // Debugging to check if req.user exists

    const { bookId } = req.params;
    const comments = await Comment.find({ book: bookId })
      .populate("user", "username email image") // Get additional fields from the user model
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

