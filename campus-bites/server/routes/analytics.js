const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyUser, checkRole } = require('../middleware/auth');

router.get('/', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);

        const [todayOrders, weekOrders, monthOrders, totalOrders, totalUsers, topProducts, hourlyData, revenueData] = await Promise.all([
            Order.countDocuments({ createdAt: { $gte: today } }),
            Order.countDocuments({ createdAt: { $gte: weekAgo } }),
            Order.countDocuments({ createdAt: { $gte: monthAgo } }),
            Order.countDocuments(),
            User.countDocuments(),
            Order.aggregate([
                { $unwind: '$items' },
                { $group: { _id: '$items.product', totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
                { $sort: { totalQty: -1 } },
                { $limit: 10 },
                { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
                { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: weekAgo } } },
                { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: monthAgo }, status: { $ne: 'cancelled' } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ])
        ]);

        const todayRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const weekRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: weekAgo }, status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            todayOrders,
            weekOrders,
            monthOrders,
            totalOrders,
            totalUsers,
            todayRevenue: todayRevenue[0]?.total || 0,
            weekRevenue: weekRevenue[0]?.total || 0,
            topProducts,
            hourlyData: Array.from({ length: 24 }, (_, i) => {
                const found = hourlyData.find(h => h._id === i);
                return { hour: i, orders: found?.count || 0 };
            }),
            revenueData
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

module.exports = router;
