const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyUser, checkRole } = require('../middleware/auth');

router.post('/', verifyUser, async (req, res) => {
    try {
        const { orderId, rating, comment, tags } = req.body;
        if (!orderId || !rating) return res.status(400).json({ message: 'Order ID and rating are required' });
        if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });

        const order = await Order.findOne({ _id: orderId, user: req.user._id });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.status !== 'completed') return res.status(400).json({ message: 'Can only rate completed orders' });

        const existing = await Feedback.findOne({ order: orderId });
        if (existing) return res.status(400).json({ message: 'Already reviewed' });

        const feedback = new Feedback({
            user: req.user._id, order: orderId, rating,
            comment: comment || '', tags: tags || []
        });
        await feedback.save();
        res.status(201).json(feedback);
    } catch (err) {
        res.status(500).json({ message: 'Error submitting feedback' });
    }
});

router.get('/product/:productId', async (req, res) => {
    try {
        const orders = await Order.find({ 'items.product': req.params.productId, status: 'completed' }).select('_id');
        const orderIds = orders.map(o => o._id);
        const feedbacks = await Feedback.find({ order: { $in: orderIds } })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching feedback' });
    }
});

router.get('/stats', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const [total, avgRating, distribution, recent] = await Promise.all([
            Feedback.countDocuments(),
            Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
            Feedback.aggregate([{ $group: { _id: '$rating', count: { $sum: 1 } } }, { $sort: { _id: -1 } }]),
            Feedback.find().populate('user', 'name').populate('order').sort({ createdAt: -1 }).limit(10)
        ]);
        res.json({
            total,
            averageRating: avgRating[0]?.avg?.toFixed(1) || 0,
            distribution: Object.fromEntries(distribution.map(d => [d._id, d.count])),
            recent
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching feedback stats' });
    }
});

module.exports = router;
