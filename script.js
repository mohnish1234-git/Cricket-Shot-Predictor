async function predict() {
    const THRESHOLD = 0.3;
    
    const file = document.getElementById("imageInput").files[0];
    const resultDiv = document.getElementById("result");
    
    if (!file) {
        resultDiv.className = "error";
        resultDiv.innerHTML = "⚠️ Please select an image first";
        return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        resultDiv.className = "error";
        resultDiv.innerHTML = "⚠️ Please upload a JPEG or PNG image";
        return;
    }

    // Show loading message
    resultDiv.className = "loading";
    resultDiv.innerHTML = "🏏 Analyzing cricket shot...";

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const base64Image = reader.result.split(",")[1];
            
            console.log("Sending request to /api/predict...");
            
            // Call our serverless function instead of Roboflow directly
            const response = await fetch('/api/predict', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    image: base64Image
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error("API Error Response:", response.status, errorData);
                throw new Error(`API returned ${response.status}: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            console.log("API Response:", data);
            
            // Handle response based on model type
            if (data.predictions) {
                // Check if it's an array (object detection) or object (classification)
                if (Array.isArray(data.predictions)) {
                    // Object detection response
                    if (data.predictions.length === 0) {
                        resultDiv.className = "low-confidence";
                        resultDiv.innerHTML = "⚠️ No shot detected. Try a clearer batting-action image.";
                        return;
                    }
                    
                    const prediction = data.predictions[0];
                    if (prediction.confidence < THRESHOLD) {
                        resultDiv.className = "low-confidence";
                        resultDiv.innerHTML = "⚠️ Low confidence. Try a clearer batting-action image.";
                    } else {
                        resultDiv.className = "success";
                        resultDiv.innerHTML = `
                            <div>✅ Prediction Complete!</div>
                            <div class="shot-name">${prediction.class}</div>
                            <div class="confidence">Confidence: ${(prediction.confidence * 100).toFixed(1)}%</div>
                        `;
                    }
                } else {
                    // Classification response
                    const predictions = data.predictions;
                    let maxClass = "";
                    let maxConfidence = 0;
                    
                    for (const [className, confidence] of Object.entries(predictions)) {
                        if (confidence > maxConfidence) {
                            maxConfidence = confidence;
                            maxClass = className;
                        }
                    }
                    
                    if (maxConfidence < THRESHOLD) {
                        resultDiv.className = "low-confidence";
                        resultDiv.innerHTML = "⚠️ Low confidence. Try a clearer batting-action image.";
                    } else {
                        resultDiv.className = "success";
                        resultDiv.innerHTML = `
                            <div>✅ Prediction Complete!</div>
                            <div class="shot-name">${maxClass}</div>
                            <div class="confidence">Confidence: ${(maxConfidence * 100).toFixed(1)}%</div>
                        `;
                    }
                }
            } else {
                resultDiv.className = "error";
                resultDiv.innerHTML = "❌ Unexpected response format. Check console.";
            }
        } catch (error) {
            console.error("Error:", error);
            resultDiv.className = "error";
            resultDiv.innerHTML = `❌ ${error.message}`;
        }
    };
    
    reader.readAsDataURL(file);
}
}
