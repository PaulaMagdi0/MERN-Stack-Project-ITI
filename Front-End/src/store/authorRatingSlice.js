import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Fetch the average rating for an author
export const fetchAuthorRating = createAsyncThunk(
  "rating/fetchAuthorRating",
  async (authorId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/rate/author/${authorId}/rating`);
      return response.data; // Returns { avgRating: 4.5, ratingCount: 10 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Fetch the user's rating for an author
export const fetchUserAuthorRating = createAsyncThunk(
  "rating/fetchUserAuthorRating",
  async ({ userID, authorId }, { rejectWithValue }) => {
    try {
      if (!userID) {
        return rejectWithValue("User ID is missing");
      }

      const response = await axios.get(`${API_URL}/rate/author/${authorId}/user/${userID}`);
      return response.data.rating; // Assuming API returns { rating: 4 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔹 Post or update a rating for an author
export const addUserAuthorRate = createAsyncThunk(
  "rating/addUserAuthorRate",
  async ({ authorId, rating, userID }, { rejectWithValue }) => {
    try {
      if (!userID) {
        return rejectWithValue("User ID is missing");
      }

      const response = await axios.post(`${API_URL}/rate/author/${authorId}/rating`, { authorId, userID, rating });

      return response.data; // Returns { success: true, newAvg: 4.3, userRating: 5 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateAuthorRating = createAsyncThunk(
  "rating/updateAuthorRating",
  async ({ authorId, rating, userID }, { rejectWithValue }) => {
    try {
      if (!userID) {
        return rejectWithValue("User ID is missing");
      }

      // Change the HTTP method from POST to PUT
      const response = await axios.put(`${API_URL}/rate/author/${authorId}/rating`, { authorId, userID, rating });

      return response.data; // Returns { success: true, newAvg: 4.3, userRating: 5 }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const authorRatingSlice = createSlice({
  name: "authorrating",
  initialState: {
    authorRating: { avgRating: null, ratingCount: 0 }, // Initializing with default values
    userAuthorRating: null,
    bookRating: { avgRating: null, ratingCount: 0 }, // Initializing book rating as well
    userRating: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
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

      // ✅ Fetch User Rating for Author
      .addCase(fetchUserAuthorRating.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserAuthorRating.fulfilled, (state, action) => {
        state.loading = false;
        state.userAuthorRating = action.payload; // Number (e.g., 4)
      })
      .addCase(fetchUserAuthorRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Add User Rating for Author
      .addCase(addUserAuthorRate.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUserAuthorRate.fulfilled, (state, action) => {
        state.loading = false;
        state.userAuthorRating = action.payload.userRating; // Update user's rating in store
        state.authorRating = {
          avgRating: action.payload.newAvg, // Update the author's average rating
          ratingCount: state.authorRating?.ratingCount || 0, // Preserve count if not returned
        };
      })
      .addCase(addUserAuthorRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Update User Rating for Author (PUT request)
      .addCase(updateAuthorRating.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAuthorRating.fulfilled, (state, action) => {
        state.loading = false;
        state.userAuthorRating = action.payload.userRating; // Update user's rating in store
        state.authorRating = {
          avgRating: action.payload.newAvg, // Update the author's average rating
          ratingCount: state.authorRating?.ratingCount || 0, // Preserve count if not returned
        };
      })
      .addCase(updateAuthorRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authorRatingSlice.reducer;
