const express = require("express");
const router = express.Router();

// Sample book data
let books = [
    { id: 1, title: "Book One", author: "Author A" },
    { id: 2, title: "Book Two", author: "Author B" },
];

// Get all books
router.get("/", (req, res) => {
    res.json(books);
});

// Get a single book by ID
router.get("/:id", (req, res) => {
    const book = books.find((b) => b.id == req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
});

// Search books by title
router.get("/search/:title", (req, res) => {
    const results = books.filter((b) =>
        b.title.toLowerCase().includes(req.params.title.toLowerCase())
    );
    res.json(results);
});

module.exports = router;
