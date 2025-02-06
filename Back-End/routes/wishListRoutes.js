const express = require("express");
const router = express.Router();
const wishlistcontroller = require("../controllers/wishlistcontroller")
// POST: Add a book to the wishlist
router.post('/add', wishlistcontroller.addToWishlist);
// GET: Fetch a user's wishlist
router.get('/:userId', wishlistcontroller.getUserWishlist);
// DELETE: Remove a wishlist item by its ID
router.delete('/:userId/:bookId', wishlistcontroller.removeFromWishlist);
module.exports = router;
