const express = require("express");
const router = express.Router();
const {getAuthors,getAuthorsByID} = require("../controllers/authorsController")

// Get all books
router.get("/", getAuthors);

// Get a single book by ID
router.get("/:id",getAuthorsByID );

// Search books by title
// router.get("/:title",getBooksByTitle` );

module.exports = router;
