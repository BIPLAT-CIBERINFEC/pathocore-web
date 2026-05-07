import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/api/client";
import { loadMepramSnapshot } from "@/api/mepram";
import { useAuth } from "@/hooks/use-auth";
import type { MepramSnapshot } from "@/types/mepram";

export function useMepram() {
  const { accessToken } = useAuth();
  const [snapshot, setSnapshot] = useState<MepramSnapshot | null>(null);
  const [status, setStatus] = useState<"error" | "idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setStatus("loading");

    try {
      const nextSnapshot = await loadMepramSnapshot(accessToken);
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
  }, [accessToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { error, refresh, snapshot, status };
}
