import { DatabrowserContext } from "@/providers/databrowser-context";
import { useContext } from "react";


export function useDatabrowser() {
  const context = useContext(DatabrowserContext);

  if (!context) {
    throw new Error("useDatabrowser must be used within DatabrowserProvider");
  }

  return context;
}
