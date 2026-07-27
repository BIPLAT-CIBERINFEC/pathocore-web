export default async function handler(req, res) {
  const { variant } = req.query;

  if (!variant) {
    return res.status(400).json({ error: "Variant is required" });
  }

  const apiTarget = (
    process.env.PATHOCORE_API_PROXY_TARGET || "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");

  try {
    const encodedVariant = encodeURIComponent(variant);

    const response = await fetch(
      `${apiTarget}/v1/variants/search?page_size=100&variant=${encodedVariant}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Error searching variants" });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
