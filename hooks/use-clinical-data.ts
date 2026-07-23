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
      if (!accessToken) {
        setStatus("loading");
        return;
      }

      setStatus("loading");
      setError(null);
      const baseUrl = process.env.NEXT_PUBLIC_PATHOCORE_API_URL;
      try {   
        const response = await fetch(`${baseUrl}/v1/${path}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
    [accessToken]
  );

  return { data, status, error, fetchData };
}
