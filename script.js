async function predict()
{
    const apiKey = "UCZKSdlwqm7vmyA9Awun";
    const model = "cricket-shot-type";
    const version = "1"; // old model (v1)
    const THRESHOLD = 0.5; // 50% confidence

    const file = document.getElementById("imageInput").files[0];
    if (!file)
    {
        document.getElementById("result").innerText = "Please select an image";
        return;
    }

    const reader = new FileReader();

    reader.onload = async () =>
    {
        const base64 = reader.result.split(",")[1];

        const response = await fetch(
            `https://classify.roboflow.com/${model}/${version}?api_key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: base64
            }
        );

        const data = await response.json();

        if (!data.predictions)
        {
            document.getElementById("result").innerText = "Prediction failed";
            return;
        }

        let bestClass = "";
        let bestScore = 0;

        for (const cls in data.predictions)
        {
            if (data.predictions[cls] > bestScore)
            {
                bestScore = data.predictions[cls];
                bestClass = cls;
            }
        }

        if (bestScore < THRESHOLD)
        {
            document.getElementById("result").innerText =
                "Low confidence. Try a clearer batting-action image.";
        }
        else
        {
            document.getElementById("result").innerText =
                `Predicted Shot: ${bestClass} (${(bestScore * 100).toFixed(2)}%)`;
        }
    };

    reader.readAsDataURL(file);
}
