const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  getUserWishlist,
  removeFromWishlist
} = require("../controllers/wishlistcontroller");

// POST: Add a book to the wishlist
router.post("/add", addToWishlist);

// GET: Fetch a user's wishlist
router.get("/:userId", getUserWishlist);

// DELETE: Remove a wishlist item by its ID
router.delete("/:wishlistItemId", removeFromWishlist);

module.exports = router;
