const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyUser } = require('../middleware/auth');

const REWARDS = [
    { name: 'Free Masala Chai', cost: 100, id: 'chai' },
    { name: 'Free Samosa', cost: 150, id: 'samosa' },
    { name: '₹50 Off Next Order', cost: 200, id: 'flat50' },
    { name: 'Free Cold Coffee', cost: 250, id: 'coffee' },
    { name: '₹100 Off Next Order', cost: 400, id: 'flat100' }
];

router.get('/balance', verifyUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('loyaltyPoints totalOrders');
        res.json({ points: user.loyaltyPoints || 0, totalOrders: user.totalOrders || 0, rewards: REWARDS });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching loyalty balance' });
    }
});

router.post('/redeem', verifyUser, async (req, res) => {
    try {
        const { rewardId } = req.body;
        const reward = REWARDS.find(r => r.id === rewardId);
        if (!reward) return res.status(400).json({ message: 'Invalid reward' });

        const user = await User.findById(req.user._id);
        if ((user.loyaltyPoints || 0) < reward.cost) {
            return res.status(400).json({ message: 'Not enough points' });
        }

        user.loyaltyPoints -= reward.cost;
        await user.save();

        res.json({ message: `${reward.name} redeemed!`, remainingPoints: user.loyaltyPoints });
    } catch (err) {
        res.status(500).json({ message: 'Error redeeming reward' });
    }
});

module.exports = router;
