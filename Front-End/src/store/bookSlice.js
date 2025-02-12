import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async Thunks
export const fetchBookById = createAsyncThunk(
  "books/fetchBookById",
  async (id, { rejectWithValue }) => {
    try {
      // /bookgenre/search-book/679ceaa7c84f85dd5c7b4083
      const response = await fetch(`${API_URL}/bookgenre/search-book/${id}`);

      // const response = await fetch(`${API_URL}/books/id/${id}`);
      if (!response.ok) throw new Error("Book not found");
      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async (page, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/books?page=${page}`);
      if (!response.ok) throw new Error("Failed to fetch books");
      const data = await response.json();
      return {
        books: data.books,
        totalPages: data.totalPages,
        currentPage: page,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const searchBooks = createAsyncThunk(
  "books/searchBooks",
  async (query, { rejectWithValue }) => {
    try {

      const response = await fetch(`${API_URL}/books/search?q=${query}`);
      if (!response.ok) throw new Error("Search failed");
      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


export const getAllGenres = createAsyncThunk(
  "/genre",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/genre`);

      if (!response.ok) {
        // If the response is not ok, throw an error
        throw new Error("Failed to fetch genres");
      }

      return await response.json();  // Return the data to the fulfilled action
    } catch (err) {
      console.error("Error fetching genres:", err);
      return rejectWithValue(err.message);  // Pass the error message to the rejected action
    }
  }
);
export const getBooksByGenre = createAsyncThunk(
  "/booksByGenre",
  async ({ GenreID, page }, { rejectWithValue }) => {
    try {
      // Fetch books for the selected genre with pagination
      const response = await fetch(`${API_URL}/bookgenre/search-genre/${GenreID}?page=${page}`);

      if (!response.ok) {
        // Get the error message from response if it's not okay
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch books for the selected genre");
      }

      // Parse the JSON response
      const data = await response.json();

      if (!data || !data.books) {
        throw new Error("Invalid data format: 'books' array missing");
      }

      // Return books and totalPages from the response
      return { books: data.books, totalPages: data.totalPages };
    } catch (err) {
      // Log the error and reject the promise with the error message
      console.error("Error fetching books by genre:", err.message || err);
      return rejectWithValue(err.message || "An unknown error occurred while fetching books");
    }
  }
);
;// /search-books/:bookID
// /bookgenre/search-books/679cf275d51cdd97c1276d3e

export const fetchGenreByBookId = createAsyncThunk(
  "books/fetchGenreById",
  async (bookID, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/bookgenre/search-books/${bookID}`);
      if (!response.ok) throw new Error("Book not found");
      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  books: [],
  currentBook: null,
  searchResults: [],
  loading: false,
  searchLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  selectedGenre: 0,
  BooksGenre: [],
  BooksGenreLoading: false,
  GenereByBookID: [],
  GenereByBookIDLoading: false,
};

const bookSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Book By ID
      .addCase(fetchBookById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentBook = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBook = action.payload;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Paginated Books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.books;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search Books
      .addCase(searchBooks.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })

      // Get All Genres
      .addCase(getAllGenres.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllGenres.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGenre = action.payload;
      })
      .addCase(getAllGenres.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Books By Genre
      .addCase(getBooksByGenre.pending, (state) => {
        state.BooksGenreLoading = true;
        state.error = null;
      })
      .addCase(getBooksByGenre.fulfilled, (state, action) => {
        state.BooksGenreLoading = false;
        state.BooksGenre = action.payload;
      })
      .addCase(getBooksByGenre.rejected, (state, action) => {
        state.BooksGenreLoading = false;
        state.error = action.payload;
      })
      // Get Genere For       
      .addCase(fetchGenreByBookId.pending, (state) => {
        state.GenereByBookIDLoading = true;
        state.error = null;
      })
      .addCase(fetchGenreByBookId.fulfilled, (state, action) => {
        state.GenereByBookIDLoading = false;
        state.GenereByBookID = action.payload;
      })
      .addCase(fetchGenreByBookId.rejected, (state, action) => {
        state.GenereByBookIDLoading = false
        state.error = action.payload;
      })

  },
});

export const { clearSearchResults } = bookSlice.actions;
export default bookSlice.reducer;
