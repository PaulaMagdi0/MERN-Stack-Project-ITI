import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunk for signing in
export const signIn = createAsyncThunk(
  "auth/signIn",
  async (values, { rejectWithValue }) => {
    try {
      const { password, username, rememberMe } = values;

      const response = await fetch(`${API_URL}/users/sign-in`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Sign-in failed");
      }

      // Store user info based on rememberMe selection
      if (data.token) {
        if (rememberMe) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userData", JSON.stringify(data.user));
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userData");
        } else {
          sessionStorage.setItem("authToken", data.token);
          sessionStorage.setItem("userData", JSON.stringify(data.user));
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
        }
      }

      return { user: data.user, token: data.token, rememberMe };
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

      console.log("User Info Response:", response.data);
      return response.data.user || response.data;
    } catch (error) {
      console.error(
        "Error fetching user info:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch user info."
      );
    }
  }
);

// Async thunk for logging out the user (including server request)
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      await axios.post(`${API_URL}/users/logout`, {}, { withCredentials: true });
      return true; // Indicate successful logout
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || error.message || "Logout failed"
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
    clearUser: (state) => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle the signIn case
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
      // Handle the getUserInfo case
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
      // Handle updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle logoutUser
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null; // Clear user data after logout
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUser } = authSlice.actions;

export default authSlice.reducer;
