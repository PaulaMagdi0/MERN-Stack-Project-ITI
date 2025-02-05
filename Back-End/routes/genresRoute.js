const express = require("express");
const router = express.Router();
const {getGenre,createGenre,updateGenre,deleteGenre} = require("../controllers/genreController")

// Get all books
router.get("/",getGenre);


router.post('/add-genre', createGenre);
router.put('/edit-genre/:id', updateGenre);
router.delete('/delete-genre/:id', deleteGenre);

module.exports = router;
