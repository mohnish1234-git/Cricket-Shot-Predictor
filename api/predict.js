// Vercel Serverless Function
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { image } = req.body;

        if (!image) {
            res.status(400).json({ error: 'No image provided' });
            return;
        }

        const apiKey = process.env.ROBOFLOW_API_KEY || "UCZKSdlwqm7vmyA9Awun";
        const model = "cricket-shot-type";
        const version = "1";

        // Try detect endpoint (for object detection models)
        let response = await fetch(
            `https://detect.roboflow.com/${model}/${version}?api_key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: image
            }
        );

        // If detect fails with 405, try classify endpoint
        if (response.status === 405) {
            console.log('Detect endpoint failed, trying classify...');
            response = await fetch(
                `https://classify.roboflow.com/${model}/${version}?api_key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: image
                }
            );
        }

        // If still 405, try outline endpoint (for instance segmentation)
        if (response.status === 405) {
            console.log('Classify endpoint failed, trying outline...');
            response = await fetch(
                `https://outline.roboflow.com/${model}/${version}?api_key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: image
                }
            );
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Roboflow API Error:', response.status, errorText);
            res.status(response.status).json({ 
                error: 'Roboflow API error', 
                details: errorText,
                status: response.status
            });
            return;
        }

        const data = await response.json();
        console.log('Roboflow response:', data);
        res.status(200).json(data);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
}
