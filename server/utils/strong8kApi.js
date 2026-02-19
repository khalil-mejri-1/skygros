const axios = require('axios');

const createSubscription = async (options, orderRef) => {
    try {
        const apiKey = process.env.STRONG8K_API_KEY || 'cec67373579d901151b52f29d3750ec1'; // Fallback to provided key if env missing

        const params = {
            action: 'new',
            type: options.type || 'm3u', // 'm3u' or 'mag'
            sub: options.duration, // 1, 3, 6, 12
            pack: options.packId,  // Package ID
            country: options.country || 'ALL',
            notes: `Order-${orderRef}`,
            api_key: apiKey
        };

        // Add MAC address if type is MAG
        if (params.type === 'mag' && options.mac) {
            params.user = options.mac; // API doc says 'user = MAC address' for MAG
        }

        console.log("STRONG8K API Request Params:", params);

        const response = await axios.get('https://my8k.me/api/api.php', { params });
        console.log("STRONG8K RESPONSE:", response.data);

        // Response is an array: [{ "status": "true", ... }]
        const data = Array.isArray(response.data) ? response.data[0] : response.data;

        if (data && data.status === "true") {
            return {
                userId: data.user_id,
                url: data.url, // URL might require formatting for M3U? API doc shows "url": "http://m3u-domain.com/get.php..."
                username: data.username, // API doc shows username/password in device info but creating m3u might just return url
                password: data.password,
                status: 'ACTIVE',
                // Add specific fields if needed
                mac: data.mac,
                message: data.message
            };
        } else {
            console.error("STRONG8K API Error Response:", data);
            throw new Error(data.message || "Failed to create subscription on STRONG 8K");
        }
    } catch (error) {
        console.error("STRONG8K API Request Failed:", error.message);
        throw error;
    }
};

module.exports = { createSubscription };
