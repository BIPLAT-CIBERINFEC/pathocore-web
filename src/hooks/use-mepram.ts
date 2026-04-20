import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/api/client";
import { loadMepramSnapshot } from "@/api/mepram";
import { useDatabrowser } from "@/hooks/use-databrowser";
import type { MepramSnapshot } from "@/types/mepram";

export function useMepram() {
  const { credentials } = useDatabrowser();
  const [snapshot, setSnapshot] = useState<MepramSnapshot | null>(null);
  const [status, setStatus] = useState<"error" | "idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setStatus("loading");

    try {
      const nextSnapshot = await loadMepramSnapshot(credentials);
      setSnapshot(nextSnapshot);
      setStatus("success");
    } catch (loadError) {
      const nextError =
        loadError instanceof ApiError
          ? loadError.message
          : "No se ha podido cargar la vista del caso de uso.";
      setError(nextError);
      setStatus("error");
    }
  }, [credentials]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { error, refresh, snapshot, status };
}
