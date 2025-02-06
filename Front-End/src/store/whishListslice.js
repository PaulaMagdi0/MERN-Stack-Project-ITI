import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Async thunk to fetch the wishlist for a given user.
 * This will make an API call to retrieve the wishlist items (books with details).
 */
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(`http://localhost:5000/wishlist/${userId}`);
      return response.data; // Expects an array of book objects with details
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
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
      await axios.delete(`http://localhost:5000/wishlist/${bookId}`);
      // Return the bookId so we can remove it from state
      return bookId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
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
    // You can add synchronous reducers here if needed.
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
      // removeWishlistItem
      .addCase(removeWishlistItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default wishlistSlice.reducer;
