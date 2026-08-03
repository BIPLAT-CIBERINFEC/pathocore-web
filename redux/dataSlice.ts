import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchSchemaSummary = createAsyncThunk(
  "data/fetchSchemaSummary",
  async (_, { rejectWithValue }) => {
    try {

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "/api/pathocore/v1"}/databrowser/schema-summary`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Error al conectar con el servidor de datos genómicos"
      );
    }
  }
);

interface DataState {
  items: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: DataState = {
  items: [],
  isLoading: false,
  error: null,
};

export const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchemaSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchSchemaSummary.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          state.error = null;
          state.items = action.payload;
        }
      )
      .addCase(
        fetchSchemaSummary.rejected,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          state.error = action.payload || "Ocurrió un error inesperado";
        }
      );
  },
});

export default dataSlice.reducer;
