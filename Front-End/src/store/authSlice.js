import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Use your API URL from an environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunk for signing in
export const signIn = createAsyncThunk(
  "auth/signIn", // action type
  async (values, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/users/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      // If the response is not OK, reject with the error message
      if (!response.ok) {
        return rejectWithValue(data.message || "Sign in failed, please try again!");
      }

      // Return the successful response data (token, user id, etc.)
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong.");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
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
        state.user = { id: action.payload.id, role: action.payload.role };
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
