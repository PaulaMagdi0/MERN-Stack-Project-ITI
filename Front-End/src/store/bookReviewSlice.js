// features/comments/commentsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosConf"; // Import axios instance

// Async thunks for making API calls
export const addComment = createAsyncThunk(
  "comments/addComment",
  async ({ bookId, commentData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/review/${bookId}`, commentData);
      return response.data.newComment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ commentId, commentData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/review/${commentId}`, commentData);
      return response.data.updatedComment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (commentId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/review/${commentId}`);
      return commentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const getCommentsByBook = createAsyncThunk(
  "comments/getCommentsByBook",
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/review/${bookId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

// Create the slice
const commentsSlice = createSlice({
  name: "comments",
  initialState: {
    comments: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCommentsByBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCommentsByBook.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(getCommentsByBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = [action.payload, ...state.comments];
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.map((comment) =>
          comment._id === action.payload._id ? action.payload : comment
        );
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.filter(
          (comment) => comment._id !== action.payload
        );
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default commentsSlice.reducer;
