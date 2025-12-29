async function predict()
{
    const apiKey = "UCZKSdlwqm7vmyA9Awun";
    const model = "cricket-shot-type";
    const version = "1";

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

        let best = "";
        let bestScore = 0;

        for (const key in data.predictions)
        {
            if (data.predictions[key] > bestScore)
            {
                bestScore = data.predictions[key];
                best = key;
            }
        }

        document.getElementById("result").innerText =
            `Predicted Shot: ${best} (${(bestScore * 100).toFixed(2)}%)`;
    };

    reader.readAsDataURL(file);
}
