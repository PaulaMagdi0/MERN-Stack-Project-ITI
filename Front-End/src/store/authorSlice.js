import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch author by ID
export const fetchAuthorById = createAsyncThunk(
  "author/fetchAuthorById",
  async (id) => {
    const response = await fetch(`http://localhost:5000/authors/id/${id}`);
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
