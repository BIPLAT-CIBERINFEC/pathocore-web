import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  status: "anonymous" | "error" | "loading" | "authenticated";
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  status: "loading",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData: (
      state,
      action: PayloadAction<{
        accessToken: string | null;
        user: AuthUser | null;
        status: AuthState["status"];
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.status = action.payload.status;
    },
    clearAuthData: (state) => {
      state.accessToken = null;
      state.user = null;
      state.status = "anonymous";
    },
  },
});

export const { setAuthData, clearAuthData } = authSlice.actions;
export default authSlice.reducer;
