import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "./bookSlice";
import authorReducer from "./authorSlice";

const store = configureStore({
  reducer: {
    book: bookReducer,
    author: authorReducer,  
  },
});

export default store;
