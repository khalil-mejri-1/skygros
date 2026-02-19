const axios = require('axios');

const apiKey = 'cec67373579d901151b52f29d3750ec1';
const url = 'https://my8k.me/api/api.php';

const testKey = async () => {
    try {
        console.log(`Testing Strong 8K API Key: ${apiKey}`);
        console.log(`URL: ${url}?action=reseller&api_key=${apiKey}`);

        const response = await axios.get(url, {
            params: {
                action: 'reseller',
                api_key: apiKey
            }
        });

        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));

        if (Array.isArray(response.data) && response.data[0].status === "true") {
            console.log("\n✅ SUCCESS: API Key is validating correctly!");
            console.log(`Credits: ${response.data[0].credits}`);
            console.log(`Username: ${response.data[0].username}`);
        } else {
            console.log("\n❌ FAILURE: API Key might be invalid or expired.");
            if (response.data && response.data.message) {
                console.log(`Message: ${response.data.message}`);
            }
        }

    } catch (error) {
        console.error("\n❌ ERROR: Request failed");
        console.error(error.message);
        if (error.response) {
            console.error("Data:", error.response.data);
        }
    }
};

testKey();
