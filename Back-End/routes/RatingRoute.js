const express = require("express");
const router = express.Router();

// Importing the controller functions for book and author ratings
const {
  getBookAverageRating,
  getUserBookRating,
  addBookRating,
  updateBookRating,
} = require("../controllers/bookRating");

const {
  getAuthorAverageRating,
  getUserAuthorRating,
  addAuthorRating,
  updateAuthorRating,
} = require("../controllers/authorRating"); // Assuming you have similar controllers for author ratings

// 🔹 Author Rating Routes
router.post("/author/:authorId/rating", addAuthorRating);    // Create or update author rating
router.put("/author/:authorId/rating", updateAuthorRating);   // Update author rating
router.get("/author/:authorId/rating", getAuthorAverageRating);  // Get the average author rating
router.get("/author/:authorId/user/:userId", getUserAuthorRating); // Get user's rating for a specific author

// 🔹 Book Rating Routes
router.post("/book/:bookId/rating", addBookRating);    // Create or update book rating
router.put("/book/:bookId/rating", updateBookRating);   // Update book rating
router.get("/book/:bookId/rating", getBookAverageRating);  // Get the average book rating
router.get("/book/:bookId/user/:userId", getUserBookRating); // Get user's rating for a specific book

module.exports = router;
