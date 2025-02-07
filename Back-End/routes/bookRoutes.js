const express = require("express");
const router = express.Router();
const { 
    getBooks, 
    getBookDetailsByID, 
    getBooksByTitle, 
    createBook, 
    searchBook, 
    deleteBook, 
    updateBook 
} = require("../controllers/bookController");

// Get all books
router.get("/", getBooks);

// Get a single book by ID
router.get("/id/:id", getBookDetailsByID);

// Get books by title
router.get("/title/:title", getBooksByTitle);

// Create a new book
router.post("/post-book", createBook);

// Delete a book by ID
router.delete("/delete-book/:bookID", deleteBook);

// Update a book by ID
router.put("/edit-book/:bookID", updateBook);

// Search books
router.get('/search', searchBook);

module.exports = router;
