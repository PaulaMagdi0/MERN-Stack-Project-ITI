import React, { useState, useEffect } from "react";
import axios from "axios";

const Reviews = ({ bookId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ comments: "", rate: 1 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/reviews?book_id=${bookId}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/reviews/add", {
        user_id: "64b0f3baf1c2b0abcd123456", // Replace with actual user ID
        book_id: bookId,
        comments: newReview.comments,
        rate: newReview.rate,
      });
      fetchReviews(); // Refresh the reviews list
      setNewReview({ comments: "", rate: 1 });
    } catch (error) {
      console.error("Error adding review:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Reviews</h2>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review._id} className="review">
            <p><strong>Rating:</strong> {review.rate} / 5</p>
            <p>{review.comments}</p>
            <hr />
          </div>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}

      <h3>Add a Review</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={newReview.comments}
          onChange={(e) => setNewReview({ ...newReview, comments: e.target.value })}
          placeholder="Write your review..."
          required
        ></textarea>
        <input
          type="number"
          min="1"
          max="5"
          value={newReview.rate}
          onChange={(e) => setNewReview({ ...newReview, rate: e.target.value })}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default Reviews;
