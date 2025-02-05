const express = require("express");
const router = express.Router();
const {GetBookGenre,GetBookGenreByID,addBookGenre,BooksByGenre} = require("../controllers/bookGenraController")

// Get all books
router.get("/",GetBookGenre);
router.get("/title/:title",GetBookGenre);
// router.get("/search",searchBook);
router.get("/id/:id",GetBookGenreByID);


router.post("/add-bookGenra",addBookGenre);

router.get("/search-genre/:genreID",BooksByGenre)
// router.put("/update-bookGenra/:bookGenraID",GetBookGenreByID);

module.exports = router;