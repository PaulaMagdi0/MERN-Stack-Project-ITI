const express = require("express");
const router = express.Router();
const wishlistcontroller = require("../controllers/wishlistcontroller");

router.post('/add', wishlistcontroller.addToWishlist);
router.get('/:userId', wishlistcontroller.getUserWishlist);
router.put('/state', wishlistcontroller.updateWishlistState);
router.delete('/:userId/:bookId', wishlistcontroller.removeFromWishlist);

module.exports = router;
