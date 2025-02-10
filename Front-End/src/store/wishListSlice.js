// store/wishListSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Fetch wishlist for a given user.
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (userId, thunkAPI) => {
    try {
        
      const response = await axios.get(`${API_URL}/wishlist/${userId}`);
      return response.data; // Expects an array of wishlist objects.
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || error.message || "An unknown error occurred."
      );
    }
  }
);

// Add a wishlist item.
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async ({ userId, bookId, state }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/wishlist/add`, { userId, bookId, state });
      // Controller returns updated wishlist array in response.data.wishlist.
      return response.data.wishlist;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || error.message || "An unknown error occurred."
      );
    }
  }
);

// Remove a wishlist item.
export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeWishlistItem',
  async ({ userId, bookId }, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/wishlist/${userId}/${bookId}`);
      return bookId; // Return bookId for updating state.
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || error.message || "An unknown error occurred."
      );
    }
  }
);

// (Optional) Update wishlist state thunk
export const updateWishlistState = createAsyncThunk(
  'wishlist/updateWishlistState',
  async ({ userId, bookId, state }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/wishlist/state`, { userId, bookId, state });
      return { bookId, state: response.data.state };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || error.message || "An unknown error occurred."
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [], // Array of wishlist objects (each has { book, state }).
    loading: false,
    error: null,
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
    clearWishlist: (state) => {
      state.items = []; // Reset the wishlist
    },
    clearError: (state) => {
      state.error = null;
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
      // addToWishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; // Replace wishlist with updated array.
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // removeWishlistItem with optimistic update:
      .addCase(removeWishlistItem.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Optimistically remove the item from the state.
        state.items = state.items.filter(item => {
          const bookId = action.meta.arg.bookId;
          if (item.book && typeof item.book === 'object' && item.book._id) {
            return item.book._id.toString() !== bookId.toString();
          }
          return item.book.toString() !== bookId.toString();
        });
      })
      .addCase(removeWishlistItem.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        // Note: In a real-world scenario, you might want to revert the optimistic update here.
      })
      // updateWishlistState (optional)
      .addCase(updateWishlistState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWishlistState.fulfilled, (state, action) => {
        state.loading = false;
        const bookId = action.payload.bookId;
        const index = state.items.findIndex(item => {
          if (item.book && typeof item.book === 'object' && item.book._id) {
            return item.book._id.toString() === bookId.toString();
          }
          return item.book.toString() === bookId.toString();
        });
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

export const { clearWishlist, clearError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
