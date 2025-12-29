async function predictShot()
{
    const apiKey = "UCZKSdlwqm7vmyA9Awun";
    const model = "cricket-shot-type";
    const version = "1";

    const fileInput = document.getElementById("inputFile");
    const file = fileInput.files[0];

    if (!file)
    {
        document.getElementById("output").innerText = "Please select an image first";
        return;
    }

    const response = await fetch(
        "https://serverless.roboflow.com/cricket-shot-type/1",
        {
            method: "POST",
            body: file
        }
    );

    const data = await response.json();

    if (data.predictions && data.predictions.length > 0)
    {
        document.getElementById("output").innerText =
            "Predicted Shot: " + data.predictions[0].class;
    }
    else
    {
        document.getElementById("output").innerText =
            "No shot detected";
    }
}
