export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const imageBuffer = Buffer.concat(chunks);

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

    if (!data.predictions) {
      return res.status(500).json({ error: "No predictions", data });
    }

    // Roboflow classification returns object of class:confidence
    const sorted = Object.entries(data.predictions)
      .sort((a, b) => b[1] - a[1]);

    const [shot, confidence] = sorted[0];

    return res.status(200).json({ shot, confidence });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
