const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { verifyUser, checkRole } = require('../middleware/auth');

router.get('/', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        const query = {};
        if (role) query.role = role;
        if (search) query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];

        const [users, total] = await Promise.all([
            User.find(query).select('-password').sort({ createdAt: -1 })
                .skip((page - 1) * limit).limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        const usersWithStats = await Promise.all(users.map(async u => {
            const orderCount = await Order.countDocuments({ user: u._id });
            const totalSpent = await Order.aggregate([
                { $match: { user: u._id, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]);
            return { ...u.toObject(), orderCount, totalSpent: totalSpent[0]?.total || 0 };
        }));

        res.json({ users: usersWithStats, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

router.put('/:id/role', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['student', 'admin', 'staff', 'lecturer', 'delivery'];
        if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });

        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error updating role' });
    }
});

router.put('/:id/ban', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isVerified = !user.isVerified;
        await user.save();
        res.json({ message: user.isVerified ? 'User unbanned' : 'User banned', user: { id: user._id, isVerified: user.isVerified } });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

router.get('/:id/orders', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.id }).populate('items.product').sort({ createdAt: -1 }).limit(50);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user orders' });
    }
});

module.exports = router;
