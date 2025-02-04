const express = require("express");
const router = express.Router();
const {GetBookGenre,GetBookGenreByID,} = require("../controllers/bookGenraController")

// Get all books
router.get("/",GetBookGenre);
router.get("/title/:title",GetBookGenre);
// router.get("/search",searchBook);
router.get("/id/:id",GetBookGenreByID);

router.get("/add-bookGenra/:bookGenraID",GetBookGenreByID);

router.get("/update-bookGenra/:bookGenraID",GetBookGenreByID);

module.exports = router;