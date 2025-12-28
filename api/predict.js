export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Read raw image bytes
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const imageBuffer = Buffer.concat(chunks);

    // Call Roboflow with RAW bytes (this is the key fix)
    const rfResponse = await fetch(
      "https://classify.roboflow.com/cricket-shot-type/1?api_key=" +
        process.env.ROBOFLOW_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream"
        },
        body: imageBuffer
      }
    );

    const data = await rfResponse.json();

    // Debug safety
    if (!data || !data.predictions || data.predictions.length === 0) {
      return res.status(500).json({ error: "No predictions from Roboflow", data });
    }

    const top = data.predictions[0];

    return res.status(200).json({
      shot: top.class,
      confidence: top.confidence
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
