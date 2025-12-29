async function predict()
{
    const apiKey = "UCZKSdlwqm7vmyA9Awun";
    const model = "cricket-shot-type";
    const version = "1";
    

    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    if (!file)
    {
        document.getElementById("result").innerText = "Please select an image";
        return;
    }

    const reader = new FileReader();

    reader.onloadend = async function ()
    {
        const base64Image = reader.result.split(",")[1];

        const response = await fetch(
            `https://infer.roboflow.com/${model}/${version}?api_key=${apiKey}`,
            {
                method: "POST",
                headers:
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    image: base64Image
                })
            }
        );

        const data = await response.json();

        if (!data.predictions || data.predictions.length === 0)
        {
            document.getElementById("result").innerText = "No shot detected";
            return;
        }

        const prediction = data.predictions[0];

        document.getElementById("result").innerText =
            `Predicted Shot: ${prediction.class} (${(prediction.confidence * 100).toFixed(2)}%)`;
    };

    reader.readAsDataURL(file);
}
