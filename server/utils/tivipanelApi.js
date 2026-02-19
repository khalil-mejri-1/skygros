const axios = require('axios');

const createSubscription = async (options, orderRef) => {
    try {
        const apiKey = process.env.TIVIPANEL_API_KEY || 'a27f6a82-0202-11f1-8b37-6edf5d6edfcb';

        const params = {
            action: 'new',
            type: options.type || 'm3u', // 'm3u' or 'mag'
            package: options.duration === 'trial' ? '0' : (options.duration || '1'), // API expects 0, 1, 3, 6, 12
            country: options.country || 'ALL',
            // template: 'skygros', // Commented out for debugging
            // Bouquets: 'skygros', // Commented out for debugging
            notes: `Order-${orderRef}`,
            api_key: apiKey
        };

        // Add correct user parameter based on type
        if (params.type === 'mag') {
            params.user = options.mac; // MAC Address for MAG
        }
        // For M3U, 'user' param is not needed as username/password are auto-generated

        console.log("TIVIPANEL API Request Params:", params);

        const response = await axios.get('https://api.tivipanel.net/reseller/panel_api.php', { params });
        console.log("TIVIPANEL RESPONSE RAW:", response.data);

        // Response is usually an array: [{ "status": "true", ... }]
        const data = Array.isArray(response.data) ? response.data[0] : response.data;

        // CHECK BOTH STRING "true" AND BOOLEAN true
        if (data && (data.status === "true" || data.status === true)) {
            let licenseMsg = "";
            let apiMessage = data.message || "Activated Successfully";

            if (params.type === 'm3u') {
                const username = data.username;
                const password = data.password;

                // If url is implicitly returned use it, otherwise show credentials
                licenseMsg = `Username: ${username}\nPassword: ${password}`;
                if (data.url) licenseMsg = data.url;

            } else {
                // For MAG
                licenseMsg = apiMessage;
            }

            return {
                userId: data.user_id, // If present
                url: licenseMsg, // Stored as licenseKey
                username: data.username,
                password: data.password,
                status: 'ACTIVE',
                message: apiMessage
            };
        } else {
            // Handle error messages that might be in different fields
            const errMsg = data.message || data.messasge || "Failed to create subscription on TIVIPANEL";
            console.error("TIVIPANEL API Error Response:", data);
            throw new Error(errMsg);
        }
    } catch (error) {
        console.error("TIVIPANEL API Request Failed:", error.message);
        throw error;
    }
};

module.exports = { createSubscription };
