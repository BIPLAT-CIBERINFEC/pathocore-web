import { useState, useEffect, useCallback } from "react";

export function useMepram(accessToken?: string | null) {
  const [snapshot, setSnapshot] = useState<any>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
 
    if (!accessToken) {
      setStatus("loading");
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const response = await fetch(
        "/api/v1/use-cases/data-summary?project_name=mepram",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {       
        if (response.status === 401) {
          throw new Error("Unauthorized (401)");
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const jsonData = await response.json();

      if (jsonData.error) {
        throw new Error(jsonData.error);
      }

      setSnapshot(jsonData);
      setStatus("success");
    } catch (err: any) {
      console.error("Error fetching mepram data:", err);
      setError(err.message || "An unexpected error occurred");
      setStatus("error");
    }
  }, [accessToken]);

  
  useEffect(() => {
    void refresh();
  }, [accessToken, refresh]);

  return {
    snapshot,
    status,
    error,
    refresh,
  };
}
