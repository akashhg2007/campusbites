const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sanitizeUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, cabinNumber: user.cabinNumber, department: user.department, phone: user.phone });

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
        if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Invalid email format' });
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const user = new User({ name: name.trim(), email: email.toLowerCase(), password, isVerified: true, role: 'student' });
        await user.save();
        const token = signToken(user);

        res.status(201).json({ message: 'Registration successful', user: sanitizeUser(user), token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { userId, email, otp } = req.body;
        if (!otp) return res.status(400).json({ message: 'OTP is required' });

        let user;
        if (userId) user = await User.findById(userId);
        else if (email) user = await User.findOne({ email: email.toLowerCase() });

        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });
        if (!user.otp || !user.otpExpires) return res.status(400).json({ message: 'Invalid or expired OTP' });
        if (user.otpExpires < Date.now()) return res.status(400).json({ message: 'Invalid or expired OTP' });
        if (user.otp.length !== otp.length) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const otpMatch = crypto.timingSafeEqual(Buffer.from(user.otp), Buffer.from(otp));
        if (!otpMatch) return res.status(400).json({ message: 'Invalid or expired OTP' });

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        const token = signToken(user);

        res.json({ message: 'Email verified successfully', user: sanitizeUser(user), token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = signToken(user);
        res.json({ message: 'Login successful', user: sanitizeUser(user), token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.json({ message: 'If an account exists with that email, a reset code has been sent' });

        const otp = crypto.randomInt(100000, 999999).toString();
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        const message = `Your password reset code is: ${otp}`;
        await sendEmail(email, 'Reset Password - Campus Bites', message, `<h1>Your Reset Code is ${otp}</h1>`);

        res.json({ message: 'If an account exists with that email, a reset code has been sent' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Email, OTP and new password are required' });
        if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Google Login
router.post('/google', async (req, res) => {
    try {
        const { credential, accessToken } = req.body;
        let email, name;

        if (credential) {
            const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
        } else if (accessToken) {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
            if (!response.ok) return res.status(400).json({ message: 'Invalid Google Token' });
            const userInfo = await response.json();
            email = userInfo.email;
            name = userInfo.name;
        } else {
            return res.status(400).json({ message: 'No credential provided' });
        }

        let user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            user = new User({ name, email: email.toLowerCase(), password: crypto.randomBytes(16).toString('hex'), isVerified: true, role: 'student' });
            await user.save();
        } else if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }

        const token = signToken(user);
        res.json({ message: 'Google login successful', user: sanitizeUser(user), token });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ message: 'Google authentication failed' });
    }
});

// Lecturer Register
router.post('/lecturer/register', async (req, res) => {
    try {
        const { name, email, password, cabinNumber, department, phone } = req.body;
        if (!name || !email || !password || !cabinNumber) return res.status(400).json({ message: 'Name, email, password and cabin number are required' });
        if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Invalid email format' });
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });

        const user = new User({ name: name.trim(), email: email.toLowerCase(), password, role: 'lecturer', cabinNumber, department: department || '', phone: phone || '', isVerified: true });
        await user.save();
        const token = signToken(user);

        res.status(201).json({ message: 'Lecturer account created successfully', user: sanitizeUser(user), token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Lecturer Login
router.post('/lecturer/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const user = await User.findOne({ email: email.toLowerCase(), role: 'lecturer' });
        if (!user || !(await user.comparePassword(password))) return res.status(400).json({ message: 'Invalid credentials' });

        const token = signToken(user);
        res.json({ message: 'Lecturer login successful', user: sanitizeUser(user), token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delivery Register
router.post('/delivery/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
        if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Invalid email format' });
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(400).json({ message: 'Email already registered' });

        const user = new User({ name: name.trim(), email: email.toLowerCase(), password, phone: phone || '', role: 'delivery', isVerified: true });
        await user.save();
        const token = signToken(user);
        res.status(201).json({ message: 'Delivery account created', user: sanitizeUser(user), token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delivery Login
router.post('/delivery/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const user = await User.findOne({ email: email.toLowerCase(), role: 'delivery' });
        if (!user || !(await user.comparePassword(password))) return res.status(400).json({ message: 'Invalid credentials' });

        const token = signToken(user);
        res.json({ message: 'Login successful', user: sanitizeUser(user), token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
