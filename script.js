async function predict() {
  const fileInput = document.getElementById("imageInput");
  const result = document.getElementById("result");

  if (!fileInput.files.length) {
    result.innerText = "Please upload an image";
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  result.innerText = "Predicting...";

  const response = await fetch("/api/predict", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    result.innerText = "Prediction failed (server error)";
    return;
  }

  const data = await response.json();

  result.innerText =
    `Shot: ${data.shot} | Confidence: ${(data.confidence * 100).toFixed(1)}%`;
}
