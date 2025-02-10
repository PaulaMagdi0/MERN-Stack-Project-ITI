import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Fetch the average rating for a book
export const fetchBookRating = createAsyncThunk(
  "rating/fetchBookRating",
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/rate/book/${bookId}/rating`);
      return response.data; // { avgRating: 4.5, ratingCount: 10 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Fetch the average rating for an author
export const fetchAuthorRating = createAsyncThunk(
  "rating/fetchAuthorRating",
  async (authorId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/rate/author/${authorId}/rating`);
      return response.data; // { avgRating: 4.2, ratingCount: 8 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Fetch the user's rating for a book
export const fetchUserBookRating = createAsyncThunk(
  "rating/fetchUserBookRating",
  async ({ userID, bookId }, { rejectWithValue }) => {
    try {
      if (!userID) return rejectWithValue("User ID is missing");

      const response = await axios.get(`${API_URL}/rate/book/${bookId}/user/${userID}`);
      return response.data.rating; // Assuming API returns { rating: 4 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Post or update a rating for a book
export const addUserRate = createAsyncThunk(
  "rating/addUserRate",
  async ({ bookId, rating, userID }, { rejectWithValue }) => {
    try {
      if (!userID) return rejectWithValue("User ID is missing");

      const response = await axios.post(`${API_URL}/rate/book/${bookId}/rating`, {
        user_id: userID,
        book_id: bookId,
        rate: rating, // Backend key
      });

      return response.data; // { success: true, newAvg: 4.3, userRating: 5 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Update an existing book rating
export const updateBookRating = createAsyncThunk(
  "rating/updateBookRating",
  async ({ bookId, rating, userID }, { rejectWithValue }) => {
    try {
      if (!userID) return rejectWithValue("User ID is missing");

      const response = await axios.put(`${API_URL}/rate/book/${bookId}/rating`, {
        user_id: userID,
        book_id: bookId,
        rate: rating,
      });

      return response.data; // { success: true, newAvg: 4.3, userRating: 5 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Redux Slice
const ratingSlice = createSlice({
  name: "rating",
  initialState: {
    bookRating: { avgRating: 0, ratingCount: 0 }, // Default values
    authorRating: { avgRating: 0, ratingCount: 0 }, // Default values
    userRating: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Fetch Book Average Rating
      .addCase(fetchBookRating.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookRating.fulfilled, (state, action) => {
        state.loading = false;
        state.bookRating = action.payload; // { avgRating, ratingCount }
      })
      .addCase(fetchBookRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Fetch Author Average Rating
      .addCase(fetchAuthorRating.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuthorRating.fulfilled, (state, action) => {
        state.loading = false;
        state.authorRating = action.payload; // { avgRating, ratingCount }
      })
      .addCase(fetchAuthorRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Fetch User Rating for Book
      .addCase(fetchUserBookRating.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserBookRating.fulfilled, (state, action) => {
        state.loading = false;
        state.userRating = action.payload; // Number (e.g., 4)
      })
      .addCase(fetchUserBookRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Add User Rating
      .addCase(addUserRate.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUserRate.fulfilled, (state, action) => {
        state.loading = false;
        state.userRating = action.payload.userRating; // Update user's rating
        state.bookRating = {
          avgRating: action.payload.newAvg, // Update book's average rating
          ratingCount: state.bookRating?.ratingCount || 0, // Preserve count
        };
      })
      .addCase(addUserRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Update User Rating
      .addCase(updateBookRating.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBookRating.fulfilled, (state, action) => {
        state.loading = false;
        state.userRating = action.payload.userRating; // Update user's rating
        state.bookRating = {
          avgRating: action.payload.newAvg, // Update book's average rating
          ratingCount: state.bookRating?.ratingCount || 0, // Preserve count
        };
      })
      .addCase(updateBookRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default ratingSlice.reducer;
