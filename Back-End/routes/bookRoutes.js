const express = require("express");
const router = express.Router();
const {
    getBooks,
    getBookDetailsByID,
    getBooksByTitle,
    createBook,
    searchBook,
    deleteBook,
    updateBook
} = require("../controllers/bookController");
const upload = require("../config/multerConfig"); // Multer config for file uploads

// ✅ Get all books
router.get("/", getBooks);

// ✅ Get a book by ID
router.get("/id/:id", getBookDetailsByID);

// ✅ Get books by title
router.get("/title/:title", getBooksByTitle);

// ✅ Create a new book (supports image & PDF upload)
router.post(
    "/post-book",
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "pdf", maxCount: 1 }
    ]),
    createBook
);

// ✅ Update a book by ID (supports optional image upload)
router.put("/edit-book/:bookID", upload.single("image"), updateBook);

// ✅ Delete a book by ID
router.delete("/delete-book/:bookID", deleteBook);

// ✅ Search books
router.get("/search", searchBook);

module.exports = router;
