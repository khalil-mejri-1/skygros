const axios = require('axios');

const createSubscription = async (options, orderRef) => {
    try {
        const apiKey = process.env.NEO_API_KEY;
        if (!process.env.NEO_API_KEY) {
            throw new Error("NEO API KEY Missing");
        }

        const params = {
            action: 'new',
            type: 'm3u',
            sub: options.duration, // 1, 3, 6, 12
            pack: options.packId,  // The selected bouquet ID
            country: options.country || 'TN',
            notes: `Order-${orderRef}`,
            api_key: apiKey
        };

        const response = await axios.get('https://neo4kpro.me/api/api.php', { params });
        console.log("NEO RESPONSE:", response.data);

        // Check if response is an array (as per doc example) and has success status
        const data = Array.isArray(response.data) ? response.data[0] : response.data;

        if (data && data.status === "true") {
            return {
                userId: data.user_id,
                url: data.url,
                status: 'ACTIVE'
            };
        } else {
            console.error("NEO API Error Response:", data);
            throw new Error(data.message || "Failed to create subscription on NEO 4K");
        }
    } catch (error) {
        console.error("NEO API Request Failed:", error.message);
        throw error;
    }
};

module.exports = { createSubscription };
