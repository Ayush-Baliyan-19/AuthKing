const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../model/userSchema");

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email service
    auth: {
        user: process.env.NODEMAILER_USER, // Your email
        pass: process.env.NODEMAILER_PASS, // Your email password
    },
});

// Route to generate and send reset password URL
router.post('/password', [
    body("email", "Enter a valid email").isEmail(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email } = req.body;


        // Save the token and its expiration in the database
        // Check if user exists
        const user = await User.findOneAndUpdate(
            { email },
            {
                $set: {
                    passwordOtp: jwt.sign({ id: email }, process.env.JWT_SECRET, { expiresIn: "15m" }),
                    otpExpiry: Date.now() + 15 * 60 * 1000, // 15 minutes from now
                },
            },
            { new: true }
        );

        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }

        const token = user.passwordOtp;
        // Generate reset password URL
        const resetUrl = `http://localhost:3001/reset/password?token=${token}`;

        // Send the reset URL via email
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link is valid for 15 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "Password reset link sent to email" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/verify-token', [
    body("token", "Token is required").notEmpty(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { token } = req.body;


        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user exists and the token matches
        const user = await User.findOne({ email: decoded.id });
        if (!user || user.passwordOtp !== token || Date.now() > user.otpExpiry) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        res.status(200).json({ success: true, message: "Token is valid" });
    } catch (err) {
        res.status(400).json({ success: false, error: "Invalid or expired token" });
    }
});

// Route to verify token and reset password
router.post('/reset/password', [
    body("token", "Token is required").notEmpty(),
    body("newpass", "Enter a valid password").isLength({ min: 8 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { token, newpass } = req.body;

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by ID
        const user = await User.findOneAndUpdate(
            { email: decoded.id, passwordOtp: token, otpExpiry: { $gt: Date.now() } },
            {
                $set: {
                    pass: await bcrypt.hash(newpass, 10),
                    passwordOtp: null,
                    otpExpiry: null,
                },
            },
            { new: true }
        );

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;