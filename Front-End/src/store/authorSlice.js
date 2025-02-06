import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunk to fetch author by ID, expecting { author, books } in response.
export const fetchAuthorById = createAsyncThunk(
  "author/fetchAuthorById",
  async (id) => {
    const response = await fetch(`${API_URL}/authors/id/${id}`);
    if (!response.ok) throw new Error("Failed to fetch author");
    return await response.json(); // Returns an object { author, books }
  }
);

const authorSlice = createSlice({
  name: "author",
  initialState: {
    author: null,
    books: [], // Add a field for the books
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuthorById.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload is an object { author, books }
        state.author = action.payload.author;
        state.books = action.payload.books;
      })
      .addCase(fetchAuthorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default authorSlice.reducer;
