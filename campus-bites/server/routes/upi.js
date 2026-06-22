const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/auth');

const UPI_ID = process.env.UPI_ID || 'campusbites@upi';
const MERCHANT_NAME = 'Campus Bites';

router.post('/create', verifyUser, (req, res) => {
    try {
        const { amount, orderId, customerName } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        const transactionId = `CB${Date.now()}`;
        const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId || transactionId}`)}&tr=${transactionId}`;

        res.json({
            upiUrl,
            transactionId,
            amount,
            merchantName: MERCHANT_NAME,
            qrData: upiUrl
        });
    } catch (err) {
        res.status(500).json({ message: 'Error generating UPI link' });
    }
});

router.post('/verify', verifyUser, (req, res) => {
    try {
        const { transactionId, orderId } = req.body;
        res.json({
            message: 'UPI payment recorded. Admin will verify.',
            transactionId,
            status: 'pending_verification'
        });
    } catch (err) {
        res.status(500).json({ message: 'Error verifying UPI payment' });
    }
});

module.exports = router;
