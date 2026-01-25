const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, email } = req.body;

        if (email === "feridadmin@admin.com") {
            return res.status(400).json({ message: "This email is reserved for administration." });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Email or username already in use." });
        }

        // Generate a random temporary password (hashed) so the account exists but can't be accessed easily until approved
        const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            balance: 0,
            isApproved: false // User must be approved by admin
        });

        await newUser.save();

        res.status(200).json({ message: "Registration successful. Please wait for admin approval." });
    } catch (err) {
        console.error("Registration error details:", err);
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { username, password, captchaToken } = req.body;

        // Verify Captcha
        if (!captchaToken) {
            // console.log("Login failed: Captcha token missing"); 
            // Optional: stricter enforcement if needed
            // return res.status(400).json("Captcha validation is required!");
        }

        // Check for fixed admin credentials
        if (username === "feridadmin@admin.com" && password === "feridadmin123") {
            let adminUser = await User.findOne({ email: "feridadmin@admin.com" });
            if (!adminUser) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash("feridadmin123", salt);
                adminUser = new User({
                    username: "Admin",
                    email: "feridadmin@admin.com",
                    password: hashedPassword,
                    balance: 999999,
                    isApproved: true
                });
                await adminUser.save();
            }

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

        // Check if approved
        if (user.isApproved === false) {
            return res.status(403).json("Votre compte est en attente d'approbation par l'administrateur.");
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json("Wrong password!");
        }

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

// APPROVE USER
const nodemailer = require('nodemailer');

const GeneralSettings = require('../models/GeneralSettings');

router.post('/approve-user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json("User not found");

        if (user.isApproved) {
            return res.status(400).json("User is already approved");
        }

        // Fetch Settings
        const settings = await GeneralSettings.findOne();
        const smtpEmail = settings?.smtpEmail || 'kmejri57@gmail.com';
        const smtpPassword = settings?.smtpPassword || 'msncmujsbjqnszxp';

        // Generate new password: 10 chars, mixed case and numbers
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let newPassword = "";
        for (let i = 0; i < 10; i++) {
            newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.isApproved = true;
        await user.save();

        // Send Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: smtpEmail,
                pass: smtpPassword
            }
        });

        const mailOptions = {
            from: smtpEmail,
            to: user.email,
            subject: 'Votre compte Skygros a été approuvé !',
            text: `Bonjour ${user.username},\n\nVotre compte a été approuvé par l'administrateur.\n\nVoici vos identifiants de connexion :\nNom d'utilisateur : ${user.username}\nMot de passe : ${newPassword}\n\nConnectez-vous maintenant sur notre site.\n\nCordialement,\nL'équipe Skygros`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email error: ", error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({ message: "User approved and email sent." });

    } catch (err) {
        console.error(err);
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
