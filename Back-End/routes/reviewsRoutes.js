// routes/reviews.js
const express = require('express');
const Review = require('../models/reviews'); // Using the corrected model
const router = express.Router();

// GET all reviews or filter by book_id
router.get('/', async (req, res) => {
  try {
    let reviews;
    if (req.query.book_id) {
      reviews = await Review.find({ book_id: req.query.book_id });
    } else {
      reviews = await Review.find();
    }
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET a single review by id
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    return res.status(200).json(review);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST create a new review
router.post('/add', async (req, res) => {
  try {
    const { user_id, comments, rate, book_id } = req.body;
    const newReview = new Review({
      user_id,
      comments,
      rate,
      book_id,
      reviewDate: new Date(),
    });
    const savedReview = await newReview.save();
    return res.status(201).json(savedReview);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
