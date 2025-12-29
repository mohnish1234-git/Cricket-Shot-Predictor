async function predict() {
  const fileInput = document.getElementById("imageInput");
  const result = document.getElementById("result");

  if (!fileInput.files.length) {
    result.innerText = "Please choose an image";
    return;
  }

  const reader = new FileReader();

  reader.onload = async () => {
    const base64Image = reader.result.split(",")[1];

    result.innerText = "Predicting...";

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      result.innerText =
        `Shot: ${data.shot} | Confidence: ${(data.confidence * 100).toFixed(1)}%`;

    } catch (err) {
      result.innerText = "Prediction failed (server error)";
    }
  };

  reader.readAsDataURL(fileInput.files[0]);
}
