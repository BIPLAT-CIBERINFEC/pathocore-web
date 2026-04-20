import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApiError } from "@/api/client";
import { loadDatabrowserSnapshot } from "@/api/databrowser";
import { STORAGE_KEY } from "@/lib/constants";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import type { ApiCredentials } from "@/types/api";
import type { DatabrowserContextValue } from "@/types/databrowser";

const envCredentials =
  import.meta.env.VITE_API_BASIC_USERNAME && import.meta.env.VITE_API_BASIC_PASSWORD
    ? {
        password: import.meta.env.VITE_API_BASIC_PASSWORD,
        username: import.meta.env.VITE_API_BASIC_USERNAME,
      }
    : null;

export const DatabrowserContext = createContext<DatabrowserContextValue | null>(null);

export function DatabrowserProvider({ children }: PropsWithChildren) {
  const [credentials, setCredentials] = useLocalStorageState<ApiCredentials | null>(
    STORAGE_KEY,
    envCredentials,
  );
  const [snapshot, setSnapshot] = useState<DatabrowserContextValue["snapshot"]>(null);
  const [status, setStatus] = useState<DatabrowserContextValue["status"]>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setStatus("loading");

    try {
      const nextSnapshot = await loadDatabrowserSnapshot(credentials);
      setSnapshot(nextSnapshot);
      setLastUpdated(new Date().toISOString());
      setStatus("success");
    } catch (loadError) {
      const nextError =
        loadError instanceof ApiError
          ? loadError.message
          : "No se ha podido cargar el databrowser.";
      setError(nextError);
      setStatus("error");
    }
  }, [credentials]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<DatabrowserContextValue>(
    () => ({
      clearCredentials: () => setCredentials(null),
      credentials,
      error,
      lastUpdated,
      refresh,
      saveCredentials: setCredentials,
      snapshot,
      status,
    }),
    [credentials, error, lastUpdated, refresh, setCredentials, snapshot, status],
  );

  return (
    <DatabrowserContext.Provider value={value}>
      {children}
    </DatabrowserContext.Provider>
  );
}
