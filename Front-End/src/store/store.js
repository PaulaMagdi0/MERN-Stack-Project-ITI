import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "./bookSlice";
import authorReducer from "./authorSlice";
import authReducer from "./authSlice";
import wishlistSlice from "./wishListSlice";


const store = configureStore({
  reducer: {
    book: bookReducer,
    author: authorReducer, 
    auth: authReducer,
    wishlist: wishlistSlice
  },
});

export default store;
