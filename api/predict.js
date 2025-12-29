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

        const apiKey = "UCZKSdlwqm7vmyA9Awun";
        const model = "cricket-shot-type";
        const version = "1";

        // Call Roboflow API
        const response = await fetch(
            `https://infer.roboflow.com/${model}/${version}?api_key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: image
            }
        );

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
        res.status(200).json(data);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
}
