import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunk for signing in
export const signIn = createAsyncThunk(
  "auth/signIn",
  async (values, { rejectWithValue }) => {
    try {
      const { username, password, RememberMe } = values;
      const response = await fetch(`${API_URL}/users/sign-in`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, RememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Sign in failed");
      }

      // Store the token and user data
      const storage = RememberMe ? localStorage : sessionStorage;
      storage.setItem("authToken", data.token);
      storage.setItem("userData", JSON.stringify(data.user));

      return { user: data.user, token: data.token };
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

// Async thunk for logging out the user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      await axios.post(`${API_URL}/users/logout`, {}, { withCredentials: true });
      // Clear all session data
      sessionStorage.clear();
      localStorage.clear();
      return true; // Indicate successful logout
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message || "Logout failed");
    }
  }
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (updateValues, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/update-profile`,
        updateValues,
        { withCredentials: true }
      );
      return response.data.updatedUser;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error?.response?.data?.error || error.message || "Failed to update profile.");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("userData")) || null,
    loading: false,
    error: null,
    isLoggedIn: !!localStorage.getItem("authToken"),
    role: null,
  },
  reducers: {
    login(state) {
      state.isLoggedIn = true;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
      sessionStorage.clear();
      localStorage.clear();
    },
    changeRole(state, action) {
      state.role = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.error = null;
      state.isLoggedIn = false;
      state.role = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
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
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.role = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUser } = authSlice.actions;

export default authSlice.reducer;
