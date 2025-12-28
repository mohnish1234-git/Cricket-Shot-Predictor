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
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const imageBuffer = Buffer.concat(chunks);

    const response = await fetch(
      `https://classify.roboflow.com/cricket-shot-type/1?api_key=${process.env.ROBOFLOW_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream"
        },
        body: imageBuffer
      }
    );

    const data = await response.json();

    if (!data.predicted_classes || data.predicted_classes.length === 0) {
      return res.status(500).json({ error: "No prediction returned" });
    }

    res.json({
      shot: data.predicted_classes[0],
      confidence: data.confidence
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
