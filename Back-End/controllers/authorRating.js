const AuthorRating = require('../models/authorRating');  // Assuming you have AuthorRating model
const Author = require('../models/authors');  // Assuming you have Author model

// 🔹 Add or update a user's rating for an author
exports.addAuthorRating = async (req, res) => {
  try {
    const { userID, rating } = req.body;
    const { authorId } = req.params;
    
    // Check if userID and rating are provided
    if (!userID || !rating) {
      return res.status(400).json({ message: "User ID and rating are required" });
    }

    // Find the existing rating for the user and author
    let authorRating = await AuthorRating.findOne({ user_id: userID, author_id: authorId });

    if (authorRating) {
      // If the rating exists, update the rating
      authorRating.rating = rating;
    } else {
      // If the rating doesn't exist, create a new one
      authorRating = new AuthorRating({ user_id: userID, author_id: authorId, rating });
    }

    await authorRating.save();

    // Calculate the new average rating for the author
    const allRatings = await AuthorRating.find({ author_id: authorId });
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    res.json({ success: true, newAvg: avgRating, userRating: rating });
  } catch (error) {
    console.error("Error in addAuthorRating:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// 🔹 Fetch the average rating for an author
exports.getAuthorAverageRating = async (req, res) => {
    try {
      const { authorId } = req.params; // Extract authorId from URL params
      const allRatings = await AuthorRating.find({ author_id: authorId });
  
      if (allRatings.length === 0) {
        return res.json({ avgRating: 0, ratingCount: 0 });
      }
  
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
  
      res.json({ avgRating, ratingCount: allRatings.length });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  // 🔹 Fetch the user's rating for a specific author
exports.getUserAuthorRating = async (req, res) => {
    try {
      const { authorId, userId } = req.params;
  
      if (!authorId || !userId) {
        return res.status(400).json({ message: "Missing authorId or userId" });
      }
  
      // Find the user's rating for the author
      const userRating = await AuthorRating.findOne({ user_id: userId, author_id: authorId });
  
      if (!userRating) {
        return res.json({ rating: null });
      }
  
      res.json({ rating: userRating.rating });
    } catch (error) {
      console.error("Error fetching user author rating:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

  // 🔹 Update the user's rating for an author
exports.updateAuthorRating = async (req, res) => {
    try {
      const { userID, rating } = req.body;
      const { authorId } = req.params;
  
      // Check if userID and rating are provided
      if (!userID || !rating) {
        return res.status(400).json({ message: "User ID and rating are required" });
      }
  
      // Find the existing author rating
      let authorRating = await AuthorRating.findOne({ user_id: userID, author_id: authorId });
  
      if (authorRating) {
        // If the rating exists, update the rating
        authorRating.rating = rating;
        await authorRating.save();
      } else {
        // If the rating doesn't exist, return an error message
        return res.status(404).json({ message: "Rating not found. Please create a rating using POST." });
      }
  
      // Calculate the new average rating for the author
      const allRatings = await AuthorRating.find({ author_id: authorId });
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
  
      res.json({ success: true, newAvg: avgRating, userRating: rating });
    } catch (error) {
      console.error("Error in updateAuthorRating:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  