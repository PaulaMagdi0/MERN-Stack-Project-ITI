const express = require("express");
const { addComment, getCommentsByBook } = require("../controllers/reviewController");
const { verifyToken } = require("../middleware/authMiddleware"); // Ensure user is logged in
const router = express.Router();

router.post("/:bookId", addComment);
router.get("/:bookId" ,getCommentsByBook);

module.exports = router;
