
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const response = await fetch(
      "http://127.0.0.1:8001/v1/databrowser/schema-summary",
      {
        headers: {
          Authorization:
            "Basic " + Buffer.from("admin:admin_pass").toString("base64"),
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching schema:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
