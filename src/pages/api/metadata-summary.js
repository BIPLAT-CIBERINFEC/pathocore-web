
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const backendRes = await fetch(
      "http://127.0.0.1:8001/v1/databrowser/metadata-summary",
      {
        headers: {
          Authorization:
            "Basic " + Buffer.from("admin:admin_pass").toString("base64"),
        },
        cache: "no-store",
      }
    );

    if (!backendRes.ok) {
      const errorBody = await backendRes
        .text()
        .catch(() => "No se pudo leer el cuerpo del error");

      console.error(
        `❌ [Backend Error] El puerto 8001 respondió con status: ${backendRes.status}`
      );
      console.error(
        `❌ [Backend Error] Detalle enviado por Python:`,
        errorBody
      );

      return res.status(backendRes.status).json({
        error: "Error en la API del backend",
        statusCode: backendRes.status,
        details: errorBody,
      });
    }

    const data = await backendRes.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching metadata summary:", error);
    return res.status(500).json({ error: "Failed to fetch data from bridge" });
  }
}
