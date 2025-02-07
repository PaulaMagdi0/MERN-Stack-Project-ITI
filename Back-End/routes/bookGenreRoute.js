const express = require("express");
const router = express.Router();
const {GetBookGenre,GetBookGenreByID,addBookGenre,BooksByGenre,GenreForBook} = require("../controllers/bookGenraController")

// Get all books
router.get("/",GetBookGenre);
// Get All Book By Title
router.get("/title/:title",GetBookGenre);

// router.get("/search",searchBook);

router.get("/id/:id",GetBookGenreByID);

//Post Book Genra
router.post("/add-bookGenra",addBookGenre);

//GetBooks By Genre

router.get("/search-genre/:genreID",BooksByGenre)

//GetBooks By Book

router.get("/search-book/:bookID",GenreForBook)


// router.put("/update-bookGenra/:bookGenraID",GetBookGenreByID);

module.exports = router;