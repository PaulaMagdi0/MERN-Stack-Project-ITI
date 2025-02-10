const express = require("express");
const { 
  addComment, 
  getCommentsByBook, 
  updateComment, 
  deleteComment 
} = require("../controllers/reviewController");
const { verifyToken } = require("../middleware/authMiddleware"); // Ensure user is logged in

const router = express.Router();

// Routes
router.post("/:bookId", addComment);       // Add a new comment
router.get("/:bookId", getCommentsByBook);              // Get all comments for a book
router.put("/:commentId", updateComment);  // Edit an existing comment
router.delete("/:commentId", deleteComment); // Delete a comment

module.exports = router;
