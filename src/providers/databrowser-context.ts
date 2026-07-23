import { createContext } from "react";
import type { DatabrowserContextValue } from "@/types/databrowser";

export const DatabrowserContext = createContext<DatabrowserContextValue | null>(null);
