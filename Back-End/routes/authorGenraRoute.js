const express = require("express");
const router = express.Router();
const {getAuthorGenre,getAuthorGenreByID} = require("../controllers/authorGenraController")

// Get all books
router.get("/",getAuthorGenre);
router.get("/id/:id",getAuthorGenreByID);

module.exports = router;
