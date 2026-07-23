import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { project_name } = req.query;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (req.headers.cookie) {
      headers["cookie"] = req.headers.cookie;
    }
    if (req.headers.authorization) {
      headers["authorization"] = req.headers.authorization;
    }
   const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(
      `${baseUrl}/use-cases/data-summary?project_name=${
        project_name || "mepram"
      }`,
      {
        method: "GET",

        headers: headers,
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Error al consultar pathocore-web: ${response.statusText}`,
        status: response.status,
      });
    }

    const dataCore = await response.json();

    return res.status(200).json(dataCore);
  } catch (error) {
    console.error("Error crítico en el proxy de migración de datos:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
