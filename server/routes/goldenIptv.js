const express = require('express');
const router = express.Router();
const axios = require('axios');

// Route to create a Golden IPTV Line
// Full Path: /api/v1/orders/create-line

// GET Packages list
router.get('/packages', async (req, res) => {
    try {
        const apiKey = process.env.GOLDEN_API_KEY;
        console.log("Fetching Golden packages and bouquets...");
        
        const headers = { 
            'X-API-Key': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };

        const response = await axios.get('https://newpanel.cx/api/v1/packages', { headers });
        
        // Handle different response structures gracefully
        if (response.data) {
            // Some APIs wrap data in a 'data' field, others return it directly
            const data = response.data.data || response.data;
            return res.status(200).json(data);
        }
        
        res.status(200).json([]);
    } catch (error) {
        console.error("Fetch packages error:", error.response?.data || error.message);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch packages from Golden API",
            error: error.response?.data || error.message
        });
    }
});

router.post('/create-line', async (req, res) => {
    try {
        const { package_id, username, password } = req.body;

        // Basic validation
        if (!package_id || !username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: package_id, username, and password are required." 
            });
        }

        // Validate username (no spaces)
        if (/\s/.test(username)) {
            return res.status(400).json({ 
                success: false, 
                message: "Username cannot contain spaces." 
            });
        }

        const apiKey = process.env.GOLDEN_API_KEY;
        if (!apiKey) {
            console.error("GOLDEN_API_KEY is missing in environment variables.");
            return res.status(500).json({ 
                success: false, 
                message: "Internal server error: Golden API key not configured." 
            });
        }

        console.log(`Creating Golden IPTV line for user: ${username}, package: ${package_id}`);

        const response = await axios.post('https://newpanel.cx/api/v1/lines', {
            package_id: parseInt(package_id),
            username: username,
            password: password,
            is_adult: false
        }, {
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        // External API returns 201 for success
        if (response.status === 201) {
            return res.status(201).json({
                success: true,
                message: "Subscription created successfully!",
                data: response.data
            });
        }

        // Fallback
        return res.status(response.status).json(response.data);

    } catch (error) {
        console.error("Golden API error:", error.response?.data || error.message);

        // Handle 422 Validation Error (e.g., username already exists)
        if (error.response && error.response.status === 422) {
            const externalMsg = error.response.data?.message || "Validation error: This username may already be taken or the package is invalid.";
            return res.status(422).json({
                success: false,
                message: externalMsg,
                errors: error.response.data?.errors
            });
        }

        // Handle other errors
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "An error occurred while contacting the Golden IPTV service.";
        
        return res.status(status).json({
            success: false,
            message: message
        });
    }
});

module.exports = router;
