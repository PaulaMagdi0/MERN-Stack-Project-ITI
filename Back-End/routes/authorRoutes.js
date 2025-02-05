const express = require("express");
const router = express.Router();
const {getAuthors,getAuthorsByID,getAuthorsByName,createAuthor,updateAuthorGenre,deleteAuthor,updateAuthor} = require("../controllers/authorsController")

// Get all books
router.get("/", getAuthors);

// Get a single book by ID
router.get("/id/:id",getAuthorsByID );

// Search books by title
router.get("/name/:name",getAuthorsByName );

//Create Author
router.post("/add-author",createAuthor)


//Put/Update Authour

// router.put("/edit-Author/:authorID",updateAuthor) // Useless

// Put AuthourGenre 
router.put("/edit-author/:authorID",updateAuthorGenre)

//  Delete Author 

router.delete("/delete-Author/:authorID",deleteAuthor)


module.exports = router;