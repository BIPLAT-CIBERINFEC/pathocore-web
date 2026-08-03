import { useState, useEffect, useCallback } from "react";

export function useClinicalData(
  accessToken?: string | null,
  endpoint: string = ""
) {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (path: string) => {
      setStatus("loading");
      setError(null);
      const baseUrl =
        process.env.NEXT_PUBLIC_MEPRAM_API_BASE_URL || "/api/omop/v1";
      try {
        const response = await fetch(`${baseUrl}/${path}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) throw new Error("Unauthorized (401)");
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
        setStatus("success");
      } catch (err: any) {
        console.error(`Error fetching clinical data for ${path}:`, err);
        setError(err.message);
        setStatus("error");
      }
    },
    []
  );

  return { data, status, error, fetchData };
}
