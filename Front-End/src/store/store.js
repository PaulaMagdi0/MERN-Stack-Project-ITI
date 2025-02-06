import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "./bookSlice";
import authorReducer from "./authorSlice";
import authReducer from "./authSlice";
import wishlist from "./wishListslice";

const store = configureStore({
  reducer: {
    book: bookReducer,
    author: authorReducer, 
    auth: authReducer,
    wishlist: wishlist, 

  },
});

export default store;
