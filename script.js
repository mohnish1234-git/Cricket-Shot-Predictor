async function predict()
{
    const apiKey = "UCZKSdlwqm7vmyA9Awun";
    const model = "cricket-shot-type";
    const version = "1";
    const THRESHOLD = 0.5;

    const file = document.getElementById("imageInput").files[0];
    if (!file)
    {
        document.getElementById("result").innerText = "Please select an image";
        return;
    }

    const reader = new FileReader();

    reader.onload = async () =>
    {
        const base64Image = reader.result.split(",")[1];

        try
        {
            const response = await fetch(
                `https://classify.roboflow.com/${model}/${version}?api_key=${apiKey}`,
                {
                    method: "POST",
                    headers:
                    {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: base64Image
                }
            );

            if (!response.ok)
            {
                document.getElementById("result").innerText =
                    "Request failed. Try again.";
                return;
            }

            const data = await response.json();

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
        }
        catch (err)
        {
            document.getElementById("result").innerText =
                "Unexpected error. Refresh and try again.";
        }
    };

    reader.readAsDataURL(file);
}
