const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyUser, checkRole } = require('../middleware/auth');

router.get('/low-stock', verifyUser, checkRole(['admin', 'staff']), async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 10;
        const products = await Product.find({ stock: { $gte: 0, $lte: threshold }, isAvailable: true }).sort({ stock: 1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching low stock' });
    }
});

router.put('/:id/stock', verifyUser, checkRole(['admin', 'staff']), async (req, res) => {
    try {
        const { stock } = req.body;
        if (stock === undefined || stock < 0) return res.status(400).json({ message: 'Invalid stock value' });

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { stock, isAvailable: stock !== 0 },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error updating stock' });
    }
});

router.post('/restock', verifyUser, checkRole(['admin', 'staff']), async (req, res) => {
    try {
        const { items } = req.body;
        if (!items?.length) return res.status(400).json({ message: 'No items provided' });

        const results = [];
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock = (product.stock || 0) + item.quantity;
                product.isAvailable = true;
                await product.save();
                results.push(product);
            }
        }
        res.json({ message: `Restocked ${results.length} items`, products: results });
    } catch (err) {
        res.status(500).json({ message: 'Error restocking' });
    }
});

module.exports = router;
