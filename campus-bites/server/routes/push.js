const express = require('express');
const router = express.Router();
const webPush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const { verifyUser } = require('../middleware/auth');

const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
    webPush.setVapidDetails('mailto:admin@campusbites.com', vapidKeys.publicKey, vapidKeys.privateKey);
}

router.get('/vapid-key', (req, res) => {
    res.json({ key: vapidKeys.publicKey });
});

router.post('/subscribe', verifyUser, async (req, res) => {
    try {
        const { endpoint, keys } = req.body;
        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return res.status(400).json({ message: 'Invalid subscription' });
        }

        await PushSubscription.findOneAndUpdate(
            { endpoint },
            { user: req.user._id, endpoint, keys },
            { upsert: true, new: true }
        );
        res.json({ message: 'Subscribed' });
    } catch (err) {
        res.status(500).json({ message: 'Error saving subscription' });
    }
});

router.post('/unsubscribe', verifyUser, async (req, res) => {
    try {
        await PushSubscription.deleteOne({ endpoint: req.body.endpoint, user: req.user._id });
        res.json({ message: 'Unsubscribed' });
    } catch (err) {
        res.status(500).json({ message: 'Error unsubscribing' });
    }
});

const sendPushNotification = async (userId, payload) => {
    try {
        const subscriptions = await PushSubscription.find({ user: userId });
        const promises = subscriptions.map(sub =>
            webPush.sendNotification(
                { endpoint: sub.endpoint, keys: sub.keys },
                JSON.stringify(payload)
            ).catch(err => {
                if (err.statusCode === 410) PushSubscription.deleteOne({ _id: sub._id });
            })
        );
        await Promise.allSettled(promises);
    } catch (err) {
        console.error('Push notification error:', err.message);
    }
};

module.exports = router;
module.exports.sendPushNotification = sendPushNotification;
