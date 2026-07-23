import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 1. Definimos la petición (Thunk)
// El primer parámetro 'data/fetchData' es solo un nombre para identificar la acción en las herramientas de desarrollo
export const fetchData = createAsyncThunk("data/fetchData", async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts"); // URL de prueba, cámbiala luego
  if (!response.ok) throw new Error("Error al obtener datos");
  return await response.json();
});

// 2. Creamos el Slice
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
