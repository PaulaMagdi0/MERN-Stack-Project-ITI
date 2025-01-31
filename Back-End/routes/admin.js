const express = require("express");
const router = express.Router();

// Sample data (Replace with database logic)
// let users = [
//     { id: 1, name: "Admin User", role: "admin" },
//     { id: 2, name: "John Doe", role: "user" },
// ];

let books = [
    { id: 1, title: "Book One", author: "Author A" },
    { id: 2, title: "Book Two", author: "Author B" },
];

// // === USERS MANAGEMENT ===

// // Get all users
// router.get("/users", (req, res) => {
//     res.json(users);
// });

// // Add a new user
// router.post("/users", (req, res) => {
//     const newUser = { id: users.length + 1, ...req.body };
//     users.push(newUser);
//     res.status(201).json({ message: "User added", user: newUser });
// });

// // Edit a user
// router.put("/users/:id", (req, res) => {
//     const user = users.find((u) => u.id == req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.name = req.body.name || user.name;
//     user.role = req.body.role || user.role;
//     res.json({ message: "User updated", user });
// });

// // Delete a user
// router.delete("/users/:id", (req, res) => {
//     users = users.filter((u) => u.id != req.params.id);
//     res.json({ message: "User deleted" });
// });

// === BOOKS MANAGEMENT ===

// Get all books
router.get("/books", (req, res) => {
    res.json(books);
});

// Add a new book
router.post("/books", (req, res) => {
    const newBook = { id: books.length + 1, ...req.body };
    books.push(newBook);
    res.status(201).json({ message: "Book added", book: newBook });
});

// Edit a book
router.put("/books/:id", (req, res) => {
    const book = books.find((b) => b.id == req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    res.json({ message: "Book updated", book });
});

// Delete a book
router.delete("/books/:id", (req, res) => {
    books = books.filter((b) => b.id != req.params.id);
    res.json({ message: "Book deleted" });
});

module.exports = router;
