const express = require("express");
const router = express.Router();
const {getAuthors,getAuthorsByID,getAuthorsByName,createAuthor,updateAuthorGenre,deleteAuthor,updateAuthor,GenresForAuthor} = require("../controllers/authorsController")
const upload = require("../config/multerConfig"); // Import Multer configuration

// Get all books

router.get("/", getAuthors);

// Get a single book by ID

// router.get("/id/:id",getAuthorsByID );

// Search books by title

router.get("/name/:name",getAuthorsByName );
// Get Genre By Author ID 

// router.get("/author-genre/:authorID",GenresForAuthor)

// Create Author
router.post("/add-author", upload.single("image"), createAuthor);
// Put AuthourGenre 
router.put("/edit-author/:authorID",upload.single("image"),updateAuthorGenre)

// Delete Author 

router.delete("/delete-Author/:authorID",deleteAuthor)
//Put/Update Authour

// router.put("/edit-Author/:authorID",updateAuthor) // Useless




module.exports = router;