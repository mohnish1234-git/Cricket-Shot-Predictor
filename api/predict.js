import fetch from "node-fetch";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const imageBuffer = Buffer.concat(buffers);

  const form = new FormData();
  form.append("file", imageBuffer, "image.jpg");

  const rfResponse = await fetch(
    `https://classify.roboflow.com/YOUR_PROJECT/YOUR_VERSION?api_key=${process.env.ROBOFLOW_API_KEY}`,
    { method: "POST", body: form }
  );

  const data = await rfResponse.json();
  const top = data.predictions[0];

  res.json({
    shot: top.class,
    confidence: top.confidence
  });
}
