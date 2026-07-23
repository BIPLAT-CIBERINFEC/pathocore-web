export default async function handler(req, res) {
  const apiTarget = (
    process.env.PATHOCORE_API_PROXY_TARGET || "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");

  try {
    const response = await fetch(`${apiTarget}/api/v1/databrowser/overview-summary`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Backend error" });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
