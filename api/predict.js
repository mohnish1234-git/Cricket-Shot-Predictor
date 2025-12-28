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

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([imageBuffer]),
      "image.jpg"
    );

    const response = await fetch(
      `https://classify.roboflow.com/cricket-shot-type/1?api_key=${process.env.ROBOFLOW_API_KEY}`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    const predictions = data.predictions;

// Get highest confidence class
    const [shot, confidence] = Object.entries(predictions)
      .sort((a, b) => b[1] - a[1])[0];
    
    res.json({
      shot,
      confidence
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
