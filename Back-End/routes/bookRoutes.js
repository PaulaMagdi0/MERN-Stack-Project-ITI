const express = require("express");
const router = express.Router();
const {getBooks,getBookDetailsByID,getBooksByTitle,createBook} = require("../controllers/bookController")

// Get all books
router.get("/", getBooks);

// Get a single book by ID
router.get("/id/:id",getBookDetailsByID );

router.get("/title/:title",getBooksByTitle );

router.post("/post-book" ,createBook)
// Search books by title


module.exports = router;
