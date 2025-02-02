const express = require("express");
const router = express.Router();
const {GetBookGenre,GetBookGenreByID} = require("../controllers/bookGenraController")

// Get all books
router.get("/",GetBookGenre);
router.get("/id/:id",GetBookGenreByID);
module.exports = router;
