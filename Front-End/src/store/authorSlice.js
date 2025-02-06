import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Async thunk to fetch author by ID
export const fetchAuthorById = createAsyncThunk(
  "author/fetchAuthorById",
  async (id) => {
    const response = await fetch(`${API_URL}/authors/id/${id}`);
    if (!response.ok) throw new Error("Failed to fetch author");
    return await response.json(); // This now only returns the author
  }
);

const authorSlice = createSlice({
  name: "author",
  initialState: {
    author: null,
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
        state.author = action.payload; // Update the state with the fetched author
      })
      .addCase(fetchAuthorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default authorSlice.reducer;
