import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "./bookSlice";
import authorReducer from "./authorSlice";
import authReducer from "./authSlice";
import wishlistSlice from "./wishListSlice";
import bookRateSlice from "./ratingSlice";
import authorRatingSlice from "./authorRatingSlice";
import commentsSlice from "./bookReviewSlice";


const store = configureStore({
  reducer: {
    book: bookReducer,
    author: authorReducer, 
    auth: authReducer,
    wishlist: wishlistSlice,
    rating: bookRateSlice,
    authorRating: authorRatingSlice,
    bookReview: commentsSlice,
    
  },
});

export default store;
