import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "./bookSlice";
import authorReducer from "./authorSlice";
import wishlistReducer from "./wishListslice"; // Correct import for wishlist reducer

const store = configureStore({
  reducer: {
    book: bookReducer,
    author: authorReducer,  
    wishlist: wishlistReducer,
  },
});

export default store;
