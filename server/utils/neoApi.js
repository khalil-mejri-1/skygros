const axios = require('axios');

// Helper to clean API response from PHP warnings/garbage
const cleanResponse = (data) => {
    if (typeof data === 'string') {
        try {
            // Find the first { and last } to extract JSON
            const start = data.indexOf('{');
            const end = data.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                return JSON.parse(data.substring(start, end + 1));
            }
        } catch (e) {
            console.error("Failed to parse cleaned JSON:", e);
        }
    }
    return data;
};

const createSubscription = async (options, orderRef, apiConfig = {}) => {
    try {
        const apiKey = apiConfig.apiKey || process.env.NEO_API_KEY;
        if (!apiKey) {
            throw new Error("NEO API KEY Missing");
        }

        // According to documentation:
        // type = m3u or mag
        // user = MAC address (if type is mag)
        // pack = package id
        // sub = 1, 3, 6, 12
        
        const type = options.type || options.subscriptionType || 'm3u';
        
        const params = {
            action: 'new',
            type: type,
            sub: options.duration,
            pack: options.packId,
            country: options.country || 'ALL',
            notes: `Order-${orderRef}`,
            api_key: apiKey
        };

        // If it's a MAG device, the documentation says we must send the MAC in the 'user' parameter
        if (type === 'mag') {
            params.user = options.mac || options.username;
        }

        console.log("NEO API Request Params:", params);

        const endpoint = apiConfig.baseUrl || 'https://neo4kpro.me/api/api.php';
        const response = await axios.get(endpoint, { params });
        
        console.log("NEO RAW RESPONSE:", response.data);
        const data = cleanResponse(response.data);
        console.log("NEO CLEANED DATA:", data);

        // Documentation says it returns an array: [ { "status": "true", ... } ]
        const finalData = Array.isArray(data) ? data[0] : data;

        if (finalData && (String(finalData.status) === "true" || finalData.status === 1 || finalData.status === "1")) {
            return {
                userId: finalData.user_id,
                url: finalData.url,
                message: finalData.message,
                status: 'ACTIVE'
            };
        } else {
            console.error("NEO API Error Response:", finalData);
            // If the error message is "Something is missing", it might be the 'sub' value or a missing 'pack'
            throw new Error(finalData?.message || finalData?.error || "Failed to create subscription on NEO 4K");
        }
    } catch (error) {
        console.error("NEO API Request Failed:", error.message);
        throw error;
    }
};

module.exports = { createSubscription };
