import fetch from "node-fetch";
import FormData from "form-data";

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

    const buffer = Buffer.concat(chunks);

    const form = new FormData();
    form.append("file", buffer, "image.jpg");

    const rfResponse = await fetch(
      "https://classify.roboflow.com/cricket-shot-type/1?api_key=" +
        process.env.ROBOFLOW_API_KEY,
      {
        method: "POST",
        body: form
      }
    );

    const data = await rfResponse.json();

    if (!data.predictions || data.predictions.length === 0) {
      return res.status(500).json({ error: "No predictions" });
    }

    const top = data.predictions[0];

    res.status(200).json({
      shot: top.class,
      confidence: top.confidence
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
