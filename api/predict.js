export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb"
    }
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

    const buffer = Buffer.concat(chunks);
    const base64Image = buffer.toString("base64");

    const rfResponse = await fetch(
      `https://classify.roboflow.com/cricket-shot-type/1?api_key=${process.env.ROBOFLOW_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: base64Image
      }
    );

    const data = await rfResponse.json();

    if (!data.predictions || data.predictions.length === 0) {
      return res.status(500).json({ error: "No predictions returned" });
    }

    const top = data.predictions[0];

    res.status(200).json({
      shot: top.class,
      confidence: top.confidence
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
