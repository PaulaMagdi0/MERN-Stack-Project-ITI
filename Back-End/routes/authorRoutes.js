const express = require("express");
const router = express.Router();
const {getAuthors,getAuthorsByID,getAuthorsByName,AddAuthor,updateAuthor,deleteAuthor} = require("../controllers/authorsController")

// Get all books
router.get("/", getAuthors);

// Get a single book by ID
router.get("/id/:id",getAuthorsByID );

// Search books by title
router.get("/name/:name",getAuthorsByName );

router.post("/Add-Author",AddAuthor)

router.delete("/delete-Author/:authorID",deleteAuthor)

router.put("/edit-Author/:authorID",updateAuthor)


module.exports = router;
// BookGenreID