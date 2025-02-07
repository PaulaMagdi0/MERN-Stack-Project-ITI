const express = require("express");
const router = express.Router();
const { getAuthorGenre, getAuthorGenreByID ,AuthorByID} = require("../controllers/authorGenraController");

// Get all author genres (with pagination)
router.get("/", getAuthorGenre);

// Get a specific author genre by ID
router.get("/:authorID", getAuthorGenreByID);


router.get("/search-author/:authorID",AuthorByID)
module.exports = router;
