const express = require("express");
const router = express.Router();
const {getBooks,getBookDetailsByID,getBooksByTitle} = require("../controllers/bookController")

// Get all books
router.get("/", getBooks);

// Get a single book by ID
router.get("/:id",getBookDetailsByID );

// Search books by title
// router.get("/:title",getBooksByTitle` );

module.exports = router;
