import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "./features/dataSlice";
import authReducer from "./features/authSlice";

export const store = configureStore({
  reducer: {
    data: dataReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
