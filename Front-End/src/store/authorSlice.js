import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunk to fetch author by ID, expecting { author, books } in response.
export const fetchAuthorById = createAsyncThunk(
  "author/fetchAuthorById",
  async (id, { rejectWithValue }) => {
    try {
      // const response = await fetch(`${API_URL}/authors/id/${id}`);
      const response = await fetch(`${API_URL}/authorgenre/search-author/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch author");
      }
      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk to fetch author's books
export const getAuthorBooks = createAsyncThunk(
  "author/getAuthorBooks",
  async (authorId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/bookgenre/book-author/${authorId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch author's books");
      }
      const data = await response.json();
      return data.books || data; // Adapt this based on your API response structure
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk to fetch author's genre
export const getAuthorGenre = createAsyncThunk(
  "author/getAuthorGenre",
  async (authorId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/authors/author-genre/${authorId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch author's genre");
      }
      const data = await response.json();
      return data.books || data; // Adapt this based on your API response structure
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Slice
const authorSlice = createSlice({
  name: "author",
  initialState: {
    author: null,
    authorsBooks: [],
    authorGenres: [],
    loading: false,
    error: null,
    booksLoading: false,
    booksError: null,
    genreLoading: false,
    genreError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchAuthorById cases
      .addCase(fetchAuthorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuthorById.fulfilled, (state, action) => {
        state.loading = false;
        state.author = action.payload;
      })
      .addCase(fetchAuthorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle getAuthorBooks cases
      .addCase(getAuthorBooks.pending, (state) => {
        state.booksLoading = true;
        state.booksError = null;
      })
      .addCase(getAuthorBooks.fulfilled, (state, action) => {
        state.booksLoading = false;
        state.authorsBooks = action.payload;
      })
      .addCase(getAuthorBooks.rejected, (state, action) => {
        state.booksLoading = false;
        state.booksError = action.payload;
      })

      // Handle getAuthorGenre cases
      .addCase(getAuthorGenre.pending, (state) => {
        state.genreLoading = true;
        state.genreError = null;
      })
      .addCase(getAuthorGenre.fulfilled, (state, action) => {
        state.genreLoading = false;
        state.authorGenres = action.payload;
      })
      .addCase(getAuthorGenre.rejected, (state, action) => {
        state.genreLoading = false;
        state.genreError = action.payload;
      });
  },
});

  export default authorSlice.reducer;
