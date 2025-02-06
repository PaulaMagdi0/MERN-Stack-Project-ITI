import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Async thunk to fetch the wishlist for a given user.
 * This will make an API call to retrieve the wishlist items (books with details).
 */
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/wishlist/${userId}`);
      return response.data; // Expects an array of book objects with details and state
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message || "An unknown error occurred.");
    }
  }
);

/**
 * Async thunk to remove a wishlist item by its book ID.
 */
export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeWishlistItem',
  async (bookId, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/wishlist/${bookId}`);
      // Return the bookId so we can remove it from state
      return bookId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message || "An unknown error occurred.");
    }
  }
);

/**
 * Async thunk to update the state of a wishlist item.
 * This endpoint is assumed to be: PUT /wishlist/state
 * with payload { userId, bookId, state }.
 */
export const updateWishlistState = createAsyncThunk(
  'wishlist/updateWishlistState',
  async ({ userId, bookId, state }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/wishlist/state`, { userId, bookId, state });
      // Assume the API returns the updated wishlist item (or entire wishlist)
      return { bookId, state: response.data.state };
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message || "An unknown error occurred.");
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Clear the wishlist
    clearWishlist: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchWishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // removeWishlistItem (Optimistic UI Update)
      .addCase(removeWishlistItem.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Optimistically remove the item from the state
        state.items = state.items.filter(item => item._id !== action.meta.arg);
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.loading = false;
        // After the item is successfully deleted, no need to do anything as it's already removed
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // updateWishlistState
      .addCase(updateWishlistState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWishlistState.fulfilled, (state, action) => {
        state.loading = false;
        // Find the item with the matching book id and update its state
        const index = state.items.findIndex(item => item._id === action.payload.bookId);
        if (index !== -1) {
          state.items[index].state = action.payload.state;
        }
      })
      .addCase(updateWishlistState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
