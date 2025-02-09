const BookRating = require("../models/bookRating");

// 🔹 Add or update a user's rating for a book
exports.addBookRating = async (req, res) => {
    try {
      const { userID, rating } = req.body;
      const { bookId } = req.params;
    //   console.log("Received Request - User ID:", userID, "Book ID:", bookId, "Rating:", rating);
  
      // Check if userID and rating are provided
      if (!userID || !rating) {
        return res.status(400).json({ message: "User ID and rating are required" });
      }
  
      // Find the existing rating for the user and book
      let bookRating = await BookRating.findOne({ user_id: userID, book_id: bookId }); // Consistent field names
  
      if (bookRating) {
        // If the rating exists, update the rating
        bookRating.rating = rating;
      } else {
        // If the rating doesn't exist, create a new one
        bookRating = new BookRating({ user_id: userID, book_id: bookId, rating }); // Consistent field names
      }
  
      // Save the book rating
      await bookRating.save();
  
      // Calculate the new average rating for the book
      const allRatings = await BookRating.find({ book_id: bookId }); // Consistent field name
      const avgRating =
        allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
  
      // Respond with the new average rating and the updated user rating
      res.json({ success: true, newAvg: avgRating, userRating: rating });
    } catch (error) {
      console.error("Error in addBookRating:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
// 🔹 Fetch the average rating for a book
exports.getBookAverageRating = async (req, res) => {
    try {
      const { bookId } = req.params; // Extract bookId from URL params
      const allRatings = await BookRating.find({ book_id: bookId }); // Consistent field name with schema
        console.log("🚀 ~ exports.getBookAverageRating= ~ bookId:", bookId)
        
      console.log("🚀 ~ exports.getBookAverageRating= ~ allRatings:", allRatings)
      // If no ratings are found, return 0 average and rating count
      if (allRatings.length === 0) {
        return res.json({ avgRating: 0, ratingCount: 0 });
      }
  
      // Calculate the average rating
      const avgRating =
        allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
  
      // Respond with the average rating and the count of ratings
      res.json({ avgRating, ratingCount: allRatings.length });
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  

// 🔹 Fetch the user's rating for a specific book
exports.getUserBookRating = async (req, res) => {
    try {
      const { bookId, userId } = req.params;
    //   console.log("Received Request - Book ID:", bookId, "User ID:", userId);
  
      // Check if bookId and userId are properly received
      if (!bookId || !userId) {
        return res.status(400).json({ message: "Missing bookId or userId" });
      }
  
      // Find the user's rating for the book
      const userRating = await BookRating.findOne({ user_id: userId, book_id: bookId });
  
      if (!userRating) {
        return res.json({ rating: null });
      }
  
    //   console.log("User Rating Found:", userRating.rating); // Debugging log
      res.json({ rating: userRating.rating });
  
    } catch (error) {
      console.error("Error fetching user book rating:", error); // Log the error
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  exports.updateBookRating = async (req, res) => {
    try {
      const { userID, rating } = req.body;  // Extracting data from body
      const { bookId } = req.params;         // Extracting bookId from params
      
    //   console.log("Received Request - User ID:", userID, "Book ID:", bookId, "Rating:", rating);
  
      // Check if userID and rating are provided
      if (!userID || !rating) {
        return res.status(400).json({ message: "User ID and rating are required" });
      }
  
      // Find the existing book rating
      let bookRating = await BookRating.findOne({ user_id: userID, book_id: bookId }); // Match field names
  
      if (bookRating) {
        // If the rating exists, update the rating
        bookRating.rating = rating;
        await bookRating.save();
      } else {
        // If the rating doesn't exist, return an error message
        return res.status(404).json({ message: "Rating not found. Please create a rating using POST." });
      }
  
      // Calculate the new average rating for the book
      const allRatings = await BookRating.find({ book_id: bookId });  // Use correct field name
      const avgRating =
        allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
  
      // Respond with the new average rating and the updated user rating
      res.json({ success: true, newAvg: avgRating, userRating: rating });
    } catch (error) {
      console.error("Error in updateBookRating:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  