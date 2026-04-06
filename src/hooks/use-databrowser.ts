import { useContext } from "react";
import { DatabrowserContext } from "@/app/providers/databrowser-provider";

export function useDatabrowser() {
  const context = useContext(DatabrowserContext);

  if (!context) {
    throw new Error("useDatabrowser must be used within DatabrowserProvider");
  }

  return context;
}
