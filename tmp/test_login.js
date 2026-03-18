const axios = require('axios');

async function test() {
    try {
        console.log("Testing login...");
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            username: "feridadmin@admin.com",
            password: "feridadmin123",
            captchaToken: "test"
        });
        console.log("Status:", res.status);
        console.log("Data:", res.data);
    } catch (err) {
        console.log("Error Status:", err.response?.status);
        console.log("Error Data:", err.response?.data);
    }
}

test();
