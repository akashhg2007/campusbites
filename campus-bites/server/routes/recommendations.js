const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyUser } = require('../middleware/auth');

const getTimeBasedSuggestions = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return ['Beverages', 'Snacks'];
    if (hour >= 10 && hour < 13) return ['Meals', 'Combos'];
    if (hour >= 13 && hour < 16) return ['Beverages', 'Snacks'];
    if (hour >= 16 && hour < 19) return ['Snacks', 'Beverages'];
    return ['Meals', 'Snacks'];
};

router.get('/', verifyUser, async (req, res) => {
    try {
        const userId = req.user._id;

        const [popularProducts, userHistory] = await Promise.all([
            Product.aggregate([
                { $match: { isAvailable: true } },
                { $sort: { orderCount: -1 } },
                { $limit: 6 }
            ]),
            Order.aggregate([
                { $match: { user: userId } },
                { $unwind: '$items' },
                { $group: { _id: '$items.product', count: { $sum: '$items.quantity' } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
                { $unwind: '$product' }
            ])
        ]);

        const timeCategories = getTimeBasedSuggestions();
        const timeBased = await Product.find({
            category: { $in: timeCategories },
            isAvailable: true
        }).limit(4).sort({ orderCount: -1 });

        const userProductIds = userHistory.map(h => h._id.toString());
        const trending = popularProducts.filter(p => !userProductIds.includes(p._id.toString())).slice(0, 4);

        res.json({
            forYou: userHistory.map(h => ({ ...h.product, orderCount: h.count })),
            trending,
            timeBased,
            message: `Recommended based on ${timeCategories.join(' & ')} (current time)`
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching recommendations' });
    }
});

module.exports = router;
