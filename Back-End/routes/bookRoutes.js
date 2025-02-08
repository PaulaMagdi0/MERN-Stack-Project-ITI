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
const upload = require("../config/multerConfig"); // Import Multer configuration

// Get all books
router.get("/", getBooks);

// Get a single book by ID
router.get("/id/:id", getBookDetailsByID);

// Get books by title
router.get("/title/:title", getBooksByTitle);

// Create a new book (supports image upload)
router.post("/post-book", upload.single("image"), createBook);

// Delete a book by ID
router.delete("/delete-book/:bookID", deleteBook);

// Update a book by ID (supports optional image upload)
router.put("/edit-book/:bookID", upload.single("image"), updateBook);

// Search books
router.get('/search', searchBook);

module.exports = router; // Ensure this appears only once
