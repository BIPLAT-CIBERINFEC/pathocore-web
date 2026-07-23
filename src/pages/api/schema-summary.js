
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const apiTarget = (
    process.env.PATHOCORE_API_PROXY_TARGET || "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");

  try {
    const response = await fetch(`${apiTarget}/api/v1/databrowser/schema-summary`, {
      cache: "no-store",
    });

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching schema:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
