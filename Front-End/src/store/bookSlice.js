import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch a book by ID
export const fetchBookById = createAsyncThunk(
  "book/fetchBookById",
  async (id) => {
    const response = await fetch(`http://localhost:5000/books/id/${id}`);
    if (!response.ok) throw new Error("Failed to fetch book");
    return await response.json();
  }
);

const bookSlice = createSlice({
  name: "book",
  initialState: {
    book: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.loading = false;
        state.book = action.payload;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default bookSlice.reducer;
