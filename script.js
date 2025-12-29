async function predict() {
  const fileInput = document.getElementById("imageInput");
  const result = document.getElementById("result");

  if (!fileInput.files.length) {
    result.innerText = "Please select an image";
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  result.innerText = "Predicting...";

  try {
    const response = await fetch("/api/predict", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.error) {
      result.innerText = "Prediction failed: " + data.error;
      return;
    }

    result.innerText =
      `Shot: ${data.shot} | Confidence: ${(data.confidence * 100).toFixed(1)}%`;

  } catch (err) {
    result.innerText = "Server error";
  }
}
