const axios = require('axios');

const createSubscription = async (options, orderRef) => {
    try {
        const apiKey = process.env.ACTIVATION_API_KEY || 'c47f4a37f6f8e13c103611ba40ac5cbd';

        const params = {
            action: 'new',
            type: options.type || 'm3u', // 'm3u' or 'mag'
            sub: options.duration, // 1, 3, 6, 12, 99
            pack: options.packId || 'all',  // Package ID or "all"
            note: `Order-${orderRef}`,
            api_key: apiKey
        };

        // Add MAC address if type is MAG
        if (params.type === 'mag' && options.mac) {
            params.mac = options.mac;
        }

        console.log("ACTIVATION PANEL API Request Params:", params);

        const response = await axios.get('https://activationpanel.net/api/api.php', { params });
        console.log("ACTIVATION PANEL RESPONSE:", response.data);

        // Response is an array: [{ "status": "true", ... }]
        const data = Array.isArray(response.data) ? response.data[0] : response.data;

        if (data && data.status === "true") {
            return {
                userId: data.user_id,
                // For M3U, API returns "url": "http://example-tt.cc/get.php?username=..."
                // For MAG, API returns "url": "https://mag-domain.com/c/"
                url: data.url,
                // The API for M3U usually includes username/password in the URL, but the response object doesn't explicitly list them in the example provided.
                // However, the example response for M3U URL is "http://example-tt.cc/get.php?username=username&password=password..."
                // We might need to parse them if we want to store them separately, but storing the URL is often enough.
                status: 'ACTIVE',
                message: data.message,
                code: data.code // For protocol type if used
            };
        } else {
            console.error("ACTIVATION PANEL API Error Response:", data);
            throw new Error(data.message || "Failed to create subscription on ACTIVATION PANEL");
        }
    } catch (error) {
        console.error("ACTIVATION PANEL API Request Failed:", error.message);
        throw error;
    }
};

module.exports = { createSubscription };
