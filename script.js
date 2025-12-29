async function predict() {
    const apiKey = "UCZKSdlwqm7vmyA9Awun";
    const model = "cricket-shot-type";
    const version = "1";
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
            
            // Correct Roboflow API endpoint for classification models
            const response = await fetch(
                `https://classify.roboflow.com/${model}/${version}?api_key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: base64Image
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error:", response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API Response:", data);
            
            // For classification models, response structure is different
            if (!data.predictions || Object.keys(data.predictions).length === 0) {
                document.getElementById("result").innerText =
                    "Low confidence. Try a clearer batting-action image.";
                return;
            }

            // Find the prediction with highest confidence
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
        } catch (error) {
            console.error("Error:", error);
            document.getElementById("result").innerText =
                "Error making prediction. Please try again or check console for details.";
        }
    };
    
    reader.readAsDataURL(file);
}
