async function predict() {
    const THRESHOLD = 0.3;
    
    const file = document.getElementById("imageInput").files[0];
    if (!file) {
        document.getElementById("result").innerText = "Please select an image";
        return;
    }

    // Show loading message
    document.getElementById("result").innerText = "Analyzing image...";

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
                        document.getElementById("result").innerText =
                            "Low confidence. Try a clearer batting-action image.";
                        return;
                    }
                    
                    const prediction = data.predictions[0];
                    if (prediction.confidence < THRESHOLD) {
                        document.getElementById("result").innerText =
                            "Low confidence. Try a clearer batting-action image.";
                    } else {
                        document.getElementById("result").innerText =
                            `Predicted Shot: ${prediction.class} (${(prediction.confidence * 100).toFixed(2)}%)`;
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
                        document.getElementById("result").innerText =
                            "Low confidence. Try a clearer batting-action image.";
                    } else {
                        document.getElementById("result").innerText =
                            `Predicted Shot: ${maxClass} (${(maxConfidence * 100).toFixed(2)}%)`;
                    }
                }
            } else {
                document.getElementById("result").innerText =
                    "Unexpected response format. Check console.";
            }
        } catch (error) {
            console.error("Error:", error);
            document.getElementById("result").innerText =
                `Error: ${error.message}. Check console for details.`;
        }
    };
    
    reader.readAsDataURL(file);
}
