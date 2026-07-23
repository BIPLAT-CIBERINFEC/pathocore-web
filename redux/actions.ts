import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


export const fetchSchemaSummary = createAsyncThunk(
  "data/fetchSchemaSummary",
  async (_, { rejectWithValue }) => {
    try {
 
      const response = await axios.get("/api/schema-summary");
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
