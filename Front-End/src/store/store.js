import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "./bookSlice";
import authorReducer from "./authorSlice";
import authReducer from "./authSlice";

const store = configureStore({
  reducer: {
    book: bookReducer,
    author: authorReducer, 
    auth: authReducer
  },
});

export default store;
