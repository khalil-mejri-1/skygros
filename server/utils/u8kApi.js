const axios = require('axios');

const createSubscription = async (options, orderRef, apiConfig = {}) => {
    try {
        const apiKey = apiConfig.apiKey || process.env.U8K_API_KEY;
        const apiSecret = apiConfig.apiSecret || process.env.U8K_API_SECRET;

        if (!apiKey || !apiSecret) {
            throw new Error("U8K API Credentials missing");
        }

        const headers = {
            'X-API-KEY': apiKey,
            'X-API-SECRET': apiSecret,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const type = options.type || 'm3u';
        
        // Root Cause Fix: bouquets and vods must be an array or "*"
        let bouquets = "*";
        let vods = "*";

        if (options.packId) {
            const packId = !isNaN(options.packId) ? parseInt(options.packId) : options.packId;
            bouquets = [packId];
            vods = [packId];
        }

        const params = {
            subscription: parseInt(options.duration) || 12,
            bouquets: bouquets,
            vods: vods,
            use_template: false,
            vod_only: false
        };

        if ((type === 'mag' || type === 'enigma2') && options.mac) {
            params.mac = options.mac;
        }

        console.log(`U8K API Sending Request to /devices/${type} with params:`, JSON.stringify(params, null, 2));

        const baseEndpoint = apiConfig.baseUrl || 'https://u8k.me/api/v1';
        const response = await axios.post(`${baseEndpoint}/devices/${type}`, params, {
            headers,
            validateStatus: () => true 
        });

        console.log(`U8K API Response [${response.status}]:`, JSON.stringify(response.data, null, 2));

        if (response.status === 201 || response.status === 200) {
            const responseData = response.data.item || response.data.data || response.data;

            if (!responseData) {
                throw new Error("U8K API returned success but no item data found.");
            }

            // Fix: ignore "[]" or empty strings for output/proxy_url
            const validUrl = (url) => (url && url !== "[]" && url !== "" && url !== "null") ? url : null;
            
            let displayKey = validUrl(responseData.output) || validUrl(responseData.proxy_url) || validUrl(responseData.url);
            
            if (!displayKey && responseData.username) {
                displayKey = `User: ${responseData.username} | Pass: ${responseData.password}`;
            }

            return {
                url: displayKey || "ACTIVE",
                username: responseData.username,
                password: responseData.password,
                mac: responseData.mac,
                status: 'ACTIVE',
                message: response.data.message || "Subscription created successfully"
            };
        } else {

            const errorMessage = response.data.message || response.data.error || `U8K API Error: ${response.status} ${response.statusText}`;
            console.error("U8K API Detailed Error:", errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error("U8K API Internal Request Failed:", error.message);
        throw error;
    }
};


// GET PACKAGES (Bouquets)
const getPackages = async (apiConfig = {}) => {
    try {
        const apiKey = apiConfig.apiKey || process.env.U8K_API_KEY;
        const apiSecret = apiConfig.apiSecret || process.env.U8K_API_SECRET;
        const baseUrl = apiConfig.baseUrl || 'https://u8k.me/api/v1';

        if (!apiKey || !apiSecret) {
            throw new Error("U8K API Credentials missing");
        }

        const headers = {
            'X-API-KEY': apiKey,
            'X-API-SECRET': apiSecret,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const response = await axios.get(`${baseUrl}/bouquets`, { headers });
        return response.data;
    } catch (error) {
        console.error("U8K API Packages Request Failed:", error.response?.data || error.message);
        throw error;
    }
};


module.exports = { createSubscription, getPackages };
