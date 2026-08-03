import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


export const fetchData = createAsyncThunk("data/fetchData", async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  if (!response.ok) throw new Error("Error al obtener datos");
  return await response.json();
});

const dataSlice = createSlice({
  name: "data",
  initialState: {
    items: [],
    isLoading: false,
    error: null as string | null,
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Error desconocido";
      });
  },
});

export default dataSlice.reducer;
