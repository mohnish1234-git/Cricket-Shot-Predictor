export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const apiKey = "UCZKSdlwqm7vmyA9Awun";
        const model = "cricket-shot-type";
        const version = "1";

        // Try the infer endpoint first
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
            return res.status(response.status).json({ 
                error: 'Roboflow API error', 
                details: errorText 
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
}
