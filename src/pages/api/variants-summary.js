export default async function handler(req, res) {
  try {
    const response = await fetch("http://127.0.0.1:8001/v1/variants/summary", {
      headers: {
        Authorization:
          "Basic " + Buffer.from("admin:admin_pass").toString("base64"),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Backend error en Variants" });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Fetch error variants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
