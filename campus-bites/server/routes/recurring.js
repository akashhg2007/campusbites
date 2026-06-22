const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/auth');

const recurringOrders = new Map();

router.post('/create', verifyUser, async (req, res) => {
    try {
        const { items, totalAmount, pickupTime, days, cronExpression } = req.body;
        if (!items?.length || !pickupTime || !days?.length) {
            return res.status(400).json({ message: 'Items, pickup time, and days are required' });
        }

        const id = `${req.user._id}_${Date.now()}`;
        const recurring = {
            id,
            userId: req.user._id.toString(),
            items,
            totalAmount,
            pickupTime,
            days,
            cronExpression: cronExpression || '0 8 * * 1-5',
            active: true,
            createdAt: new Date()
        };

        recurringOrders.set(id, recurring);
        res.json({ message: 'Recurring order created', recurring });
    } catch (err) {
        res.status(500).json({ message: 'Error creating recurring order' });
    }
});

router.get('/mine', verifyUser, (req, res) => {
    const userOrders = Array.from(recurringOrders.values())
        .filter(o => o.userId === req.user._id.toString());
    res.json(userOrders);
});

router.delete('/:id', verifyUser, (req, res) => {
    const order = recurringOrders.get(req.params.id);
    if (!order || order.userId !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Recurring order not found' });
    }
    order.active = false;
    recurringOrders.delete(req.params.id);
    res.json({ message: 'Recurring order cancelled' });
});

module.exports = router;
module.exports.recurringOrders = recurringOrders;
