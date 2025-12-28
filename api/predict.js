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

    // Call Roboflow Classification API
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

    const text = await rfResponse.text(); // DEBUG SAFE
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "Roboflow returned non-JSON",
        raw: text
      });
    }

    if (!data.predictions || Object.keys(data.predictions).length === 0) {
      return res.status(500).json({
        error: "No predictions returned",
        data
      });
    }

    const sorted = Object.entries(data.predictions)
      .sort((a, b) => b[1] - a[1]);

    const [shot, confidence] = sorted[0];

    return res.status(200).json({
      shot,
      confidence
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
