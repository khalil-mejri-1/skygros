const axios = require('axios');

const createSubscription = async (options, orderRef) => {
    try {
        const apiKey = process.env.PROMAX_API_KEY || '7dHa1DfhEdWJWgYJSETHLbOeHgxYI9B3ad0SGkHT/l3jftyZAco/s22w/9Kg3Ht3';
        const baseUrl = 'https://api.promax-dash.com/api.php';

        const params = {
            action: 'new',
            type: options.type || 'm3u', // 'm3u' or 'mag'
            sub: options.duration || '12', // API expects 1, 3, 6, 12
            pack: options.packId || '1',
            country: options.country || 'ALL',
            notes: `Order-${orderRef}`,
            api_key: apiKey
        };

        if (params.type === 'mag') {
            params.user = options.mac; // MAC Address for MAG
        }

        console.log("PROMAX API Request Params:", params);

        const response = await axios.get(baseUrl, { params });
        console.log("PROMAX RESPONSE RAW:", response.data);

        // Response is usually an array: [{ "status": "true", ... }]
        const data = Array.isArray(response.data) ? response.data[0] : response.data;

        if (data && (data.status === "true" || data.status === true)) {
            let licenseMsg = "";
            let apiMessage = data.message || "Activated Successfully";

            if (params.type === 'm3u') {
                // For M3U, it returns a URL
                licenseMsg = data.url || "M3U Created Successfully";
            } else {
                // For MAG
                licenseMsg = `MAC: ${data.mac}\nPortal: ${data.url || 'N/A'}`;
            }

            return {
                userId: data.user_id,
                url: licenseMsg,
                status: 'ACTIVE',
                message: apiMessage
            };
        } else {
            const errMsg = data.message || data.messasge || "Failed to create subscription on PROMAX";
            console.error("PROMAX API Error Response:", data);
            throw new Error(errMsg);
        }
    } catch (error) {
        console.error("PROMAX API Request Failed:", error.message);
        throw error;
    }
};

const getBouquets = async () => {
    try {
        const apiKey = process.env.PROMAX_API_KEY || '7dHa1DfhEdWJWgYJSETHLbOeHgxYI9B3ad0SGkHT/l3jftyZAco/s22w/9Kg3Ht3';
        const response = await axios.get('https://api.promax-dash.com/api.php', {
            params: {
                action: 'bouquet',
                public: 1,
                api_key: apiKey
            }
        });
        return response.data;
    } catch (error) {
        console.error("PROMAX Get Bouquets Failed:", error.message);
        return [];
    }
};

module.exports = { createSubscription, getBouquets };
