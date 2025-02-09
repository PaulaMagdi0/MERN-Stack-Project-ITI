import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Fetch the average rating for a book
export const fetchBookRating = createAsyncThunk(
  "rating/fetchBookRating",
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/rate/book/${bookId}/rating`);
      return response.data; // Returns { avgRating: 4.5, ratingCount: 10 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);




// 🔹 Fetch the user's rating for a book
export const fetchUserBookRating = createAsyncThunk(
  "rating/fetchUserBookRating",
  async ({userID, bookId,}, {  rejectWithValue }) => {
    try {
      if (!userID) {
        return rejectWithValue("User ID is missing");
      }

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
  async ({ bookId, rating,userID }, { rejectWithValue }) => {
    try {


      if (!userID) {
        return rejectWithValue("User ID is missing");
      }

      const response = await axios.post(`${API_URL}/rate/book/${bookId}/rating`, { bookId,userID, rating });

      return response.data; // Returns { success: true, newAvg: 4.3, userRating: 5 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateBookRating = createAsyncThunk(
    "rating/updateBookRating",
    async ({ bookId, rating ,userID}, {  rejectWithValue }) => {
      try {

  
        if (!userID) {
          return rejectWithValue("User ID is missing");
        }
  
        // Change the HTTP method from POST to PUT
        const response = await axios.put(`${API_URL}/rate/book/${bookId}/rating`, { bookId, userID, rating });
  
        return response.data; // Returns { success: true, newAvg: 4.3, userRating: 5 }
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
    }
  );
  

const ratingSlice = createSlice({
    name: "rating",
    initialState: {
      bookRating: { avgRating: null, ratingCount: 0 }, // Initializing with default values
      userRating: null,
      loading: false,
      error: null,
    },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Fetch Book Average Rating
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
        state.userRating = action.payload.userRating; // Update user's rating in store
        state.bookRating = {
          avgRating: action.payload.newAvg, // Update the book's average rating
          ratingCount: state.bookRating?.ratingCount || 0, // Preserve count if not returned
        };
      })
      .addCase(addUserRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Update User Rating (PUT request)
      .addCase(updateBookRating.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBookRating.fulfilled, (state, action) => {
        state.loading = false;
        state.userRating = action.payload.userRating; // Update user's rating in store
        state.bookRating = {
          avgRating: action.payload.newAvg, // Update the book's average rating
          ratingCount: state.bookRating?.ratingCount || 0, // Preserve count if not returned
        };
      })
      .addCase(updateBookRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })}
});

export default ratingSlice.reducer;
