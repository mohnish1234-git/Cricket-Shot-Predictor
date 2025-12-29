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

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const base64Image = reader.result.split(",")[1];
            
            // Use the correct Roboflow endpoint format
            const response = await fetch(
                `https://detect.roboflow.com/${model}/${version}?api_key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: base64Image
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.predictions || data.predictions.length === 0) {
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
        } catch (error) {
            console.error("Error:", error);
            document.getElementById("result").innerText =
                "Error making prediction. Check console for details.";
        }
    };
    
    reader.readAsDataURL(file);
}
