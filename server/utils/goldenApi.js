const axios = require('axios');

const getBaseUrl = () => {
    return process.env.GOLDEN_BASE_URL || 'https://newpanel.cx/api';
};

const getHeaders = () => {
    const apiKey = process.env.GOLDEN_API_KEY;
    if (!apiKey) {
        throw new Error("GOLDEN_API_KEY missing in environment");
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey // Adding both just in case
    };
};

const createSubscription = async (options, orderRef) => {
    try {
        const headers = getHeaders();
        const baseUrl = getBaseUrl();

        // options contains:
        // type: 'm3u', 'mag', 'activecode'
        // packId: package_id (integer)
        // mac: for mag

        let endpoint = '';
        let payload = {};

        const package_id = parseInt(options.packId, 10);
        if (isNaN(package_id)) {
            throw new Error(`Invalid Golden package_id: ${options.packId}`);
        }

        // Generic options
        const isAdult = options.is_adult !== undefined ? options.is_adult : false;

        if (options.type === 'm3u') {
            endpoint = '/v1/lines';
            // Generate random username and password if not provided
            const rString = Math.random().toString(36).substring(2, 8);
            payload = {
                package_id: package_id,
                username: options.username || `user_${rString}`,
                password: options.password || `pass_${rString}`,
                is_adult: isAdult,
                notes: `Order Ref: ${orderRef}`
            };
        } else if (options.type === 'mag') {
            endpoint = '/v1/mags';
            if (!options.mac) {
                throw new Error("MAC address is required for MAG subscription");
            }
            payload = {
                package_id: package_id,
                mac: options.mac,
                is_adult: isAdult,
                notes: `Order Ref: ${orderRef}`
            };
        } else if (options.type === 'activecode') {
            endpoint = '/v1/active-codes';
            payload = {
                package_id: package_id,
                is_adult: isAdult,
                notes: `Order Ref: ${orderRef}`
            };
        } else {
            throw new Error(`Unsupported Golden subscription type: ${options.type}`);
        }

        console.log(`Sending to Golden API: ${baseUrl}${endpoint} with payload`, payload);

        const response = await axios.post(`${baseUrl}${endpoint}`, payload, { headers });

        if (response.data && response.data.success) {
            const data = response.data.data;

            if (options.type === 'm3u') {
                // Lines endpoint returns an array in data
                const line = Array.isArray(data) ? data[0] : (data.lines ? data.lines[0] : data);
                return {
                    username: line.username,
                    password: line.password,
                    url: `http://golden-dns.com/get.php?username=${line.username}&password=${line.password}&type=m3u_plus&output=ts`, // This might need to be customizable
                    status: 'ACTIVE',
                    message: "Line created successfully",
                    raw: data
                };
            } else if (options.type === 'mag') {
                return {
                    mac: data.mac,
                    url: "MAC registered successfully",
                    status: 'ACTIVE',
                    message: "MAG created successfully",
                    raw: data
                };
            } else if (options.type === 'activecode') {
                return {
                    code: data.code,
                    url: data.code,
                    status: 'ACTIVE',
                    message: "Active Code created successfully",
                    raw: data
                };
            }
        } else {
            throw new Error(response.data?.message || "Failed to create Golden subscription");
        }

    } catch (error) {
        console.error("Golden API Error:", error.response?.data || error.message);
        throw error;
    }
};

const getProfile = async () => {
    try {
        const headers = getHeaders();
        const baseUrl = getBaseUrl();
        const response = await axios.get(`${baseUrl}/v1/account/profile`, { headers });
        if (response.data && response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data?.message || "Failed to retrieve profile");
        }
    } catch (error) {
        console.error("Golden API Profile Error:", error.response?.data || error.message);
        throw error;
    }
};

module.exports = { createSubscription, getProfile };
