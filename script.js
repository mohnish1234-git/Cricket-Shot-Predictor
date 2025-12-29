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

    // Upload image to temporary URL
    const formData = new FormData();
    formData.append("file", file);

    const upload = await fetch("https://tmpfiles.org/api/v1/upload", {
        method: "POST",
        body: formData
    });

    const uploadData = await upload.json();
    const imageUrl = uploadData.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");

    // Call Roboflow SERVERLESS endpoint
    const response = await fetch(
        `https://serverless.roboflow.com/${model}/${version}?api_key=${apiKey}&image=${encodeURIComponent(imageUrl)}`
    );

    const data = await response.json();

    if (!data.predictions || data.predictions.length === 0)
    {
        document.getElementById("result").innerText = "No shot detected";
        return;
    }

    document.getElementById("result").innerText =
        `Predicted Shot: ${data.predictions[0].class} (${(data.predictions[0].confidence * 100).toFixed(2)}%)`;
}
