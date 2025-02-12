const express = require("express");
const router = express.Router();
const {GetBookGenre,GetBookGenreByID,BooksByGenre,GenreForBook,BooksByAuthor,BookByID,GetBooksWithGenresAndTotalRating} = require("../controllers/bookGenraController")

// Get all books
router.get("/",GetBooksWithGenresAndTotalRating);

// router.get("/search",searchBook);

router.get("/id/:id",GetBookGenreByID);


//GetBooks By Genre

router.get('/search-genre/:genreID', BooksByGenre);
//GetBooks By Gener

router.get("/search-books/:bookID",GenreForBook)

// Get Books by Author ID

router.get('/book-author/:authorID',BooksByAuthor);

// Get Book by Book ID

router.get('/search-book/:bookID',BookByID);
// router.put("/update-bookGenra/:bookGenraID",GetBookGenreByID);

//Post Book Genra
// router.post("/add-bookGenra",addBookGenre);

// Get All Book By Title
// router.get("/title/:title",GetBookGenre);




module.exports = router;