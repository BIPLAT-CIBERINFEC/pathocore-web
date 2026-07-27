
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const apiTarget = (
    process.env.PATHOCORE_API_PROXY_TARGET || "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");

  try {
    const backendRes = await fetch(`${apiTarget}/v1/databrowser/metadata-summary`, {
      cache: "no-store",
    });

    if (!backendRes.ok) {
      const errorBody = await backendRes
        .text()
        .catch(() => "Could not read backend error body");

      console.error(
        `[Backend Error] PathoCore API responded with status: ${backendRes.status}`
      );
      console.error("[Backend Error] Detail:", errorBody);

      return res.status(backendRes.status).json({
        error: "Backend API error",
        statusCode: backendRes.status,
        details: errorBody,
      });
    }

    const data = await backendRes.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching metadata summary:", error);
    return res.status(500).json({ error: "Failed to fetch backend data" });
  }
}
