const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        if (req.body.email === "feridadmin@admin.com") {
            return res.status(400).json("This email is reserved for administration.");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            balance: 0,
        });

        const savedUser = await newUser.save();
        const { password, ...others } = savedUser._doc;
        res.status(200).json(others);
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json(err);
    }
});


router.post('/login', async (req, res) => {
    try {
        const { username, password, captchaToken } = req.body;

        // Verify Captcha
        if (!captchaToken) return res.status(400).json("Captcha validation is required!");

        const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const secretKey = '0x4AAAAAACN94-30N8OFz0mZtiJR5Q_3UeE';

        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', captchaToken);
        formData.append('remoteip', req.ip);

        const verifyRes = await fetch(verifyUrl, {
            method: 'POST',
            body: formData,
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
            return res.status(400).json("Captcha validation failed!");
        }

        // Check for fixed admin credentials
        if (username === "feridadmin@admin.com" && password === "feridadmin123") {
            let adminUser = await User.findOne({ email: "feridadmin@admin.com" });

            // Create admin user in DB if not exists (for ID consistency)
            if (!adminUser) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash("feridadmin123", salt);
                adminUser = new User({
                    username: "Admin",
                    email: "feridadmin@admin.com",
                    password: hashedPassword,
                    balance: 999999
                });
                await adminUser.save();
            }

            // Check 2FA for Admin
            if (adminUser.is2FAEnabled) {
                return res.status(200).json({
                    twoFARequired: true,
                    userId: adminUser._id,
                    isAdmin: true,
                    message: "2FA code required"
                });
            }

            const accessToken = jwt.sign(
                { id: adminUser._id, isAdmin: true },
                process.env.JWT_SEC || "secretkey",
                { expiresIn: "3d" }
            );

            const { password: pw, ...others } = adminUser._doc;
            return res.status(200).json({ ...others, accessToken, isAdmin: true });
        }

        // Regular user login
        const user = await User.findOne({
            $or: [{ username: username }, { email: username }]
        });
        if (!user) return res.status(404).json("User not found!");

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json("Wrong password!");

        // Check 2FA for regular user
        if (user.is2FAEnabled) {
            return res.status(200).json({
                twoFARequired: true,
                userId: user._id,
                isAdmin: false,
                message: "2FA code required"
            });
        }

        const accessToken = jwt.sign(
            { id: user._id, isAdmin: false },
            process.env.JWT_SEC || "secretkey",
            { expiresIn: "3d" }
        );

        const { password: pw, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken, isAdmin: false });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json(err);
    }
});

router.post('/2fa/verify', async (req, res) => {
    try {
        const { userId, token } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json("User not found!");

        const verified = speakeasy.totp.verify({
            secret: user.twoFASecret,
            encoding: 'base32',
            token,
            window: 2 // Slightly more lenient window
        });

        if (!verified) return res.status(400).json("Invalid 2FA code!");

        // Determine if user is admin based on email or existing isAdmin logic
        const isAdmin = user.email === "feridadmin@admin.com";

        const accessToken = jwt.sign(
            { id: user._id, isAdmin: isAdmin },
            process.env.JWT_SEC || "secretkey",
            { expiresIn: "3d" }
        );

        const { password: pw, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken, isAdmin });

    } catch (err) {
        console.error("2FA Verify Error:", err);
        res.status(500).json(err);
    }
});

module.exports = router;
