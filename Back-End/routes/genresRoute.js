const express = require("express");
const router = express.Router();
const {getGenre} = require("../controllers/genreController")

// Get all books
router.get("/",getGenre);

module.exports = router;
