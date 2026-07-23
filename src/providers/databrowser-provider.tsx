import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApiError } from "@/api/client";
import { loadDatabrowserSnapshot } from "@/api/databrowser";
import { DatabrowserContext } from "@/app/providers/databrowser-context";
import type { DatabrowserContextValue } from "@/types/databrowser";

const LEGACY_CREDENTIALS_STORAGE_KEY = "pathocore-web.api-credentials";

export function DatabrowserProvider({ children }: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState<DatabrowserContextValue["snapshot"]>(null);
  const [status, setStatus] = useState<DatabrowserContextValue["status"]>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setStatus("loading");

    try {
      const nextSnapshot = await loadDatabrowserSnapshot();
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
  }, []);

  useEffect(() => {
    localStorage.removeItem(LEGACY_CREDENTIALS_STORAGE_KEY);
    void refresh();
  }, [refresh]);

  const value = useMemo<DatabrowserContextValue>(
    () => ({
      error,
      lastUpdated,
      refresh,
      snapshot,
      status,
    }),
    [error, lastUpdated, refresh, snapshot, status],
  );

  return (
    <DatabrowserContext.Provider value={value}>
      {children}
    </DatabrowserContext.Provider>
  );
}
