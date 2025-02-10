import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunk for signing in
export const signIn = createAsyncThunk(
  "auth/signIn",
  async (values, { rejectWithValue }) => {
    try {
      const { password, username, RememberMe } = values;
      const response = await fetch(`${API_URL}/users/sign-in`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, RememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Sign in failed");
      }

      // Ensure the response contains both user data and token
      return {
        user: data.user,
        token: data.token
      };
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong.");
    }
  }
);

// Async thunk for getting user info
export const getUserInfo = createAsyncThunk(
  "auth/getUserInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/get-user-info`, {
        withCredentials: true,
      });
      
      console.log('User Info Response:', response.data);
      return response.data.user || response.data;
    } catch (error) {
      console.error('Error fetching user info:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        "Failed to fetch user info."
      );
    }
  }
);

// NEW: Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (updateValues, { rejectWithValue }) => {
    try {
      // updateValues should include the fields the user is allowed to update.
      // The update endpoint is /users/update-profile and expects a PUT request.
      const response = await axios.put(
        `${API_URL}/users/update-profile`,
        updateValues,
        { withCredentials: true }
      );
      // Assume response.data.updatedUser contains the updated user data.
      return response.data.updatedUser;
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update profile."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      // axios.post(`${API_URL}/users/logout`, {}, { withCredentials: true });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
      })
      .addCase(getUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile extra reducers
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Update the user object with the updated data.
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
