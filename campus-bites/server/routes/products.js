const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');
const { verifyUser, checkRole } = require('../middleware/auth');

const ALLOWED_CATEGORIES = ['Snacks', 'Meals', 'Beverages'];
const ALLOWED_FIELDS = ['name', 'description', 'price', 'category', 'image', 'isAvailable', 'isVeg'];

const pickAllowed = (body) => {
    const obj = {};
    for (const key of ALLOWED_FIELDS) {
        if (body[key] !== undefined) obj[key] = body[key];
    }
    return obj;
};

// Get all products (Public)
router.get('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database not connected' });
        }
        const { category } = req.query;
        let query = {};
        if (category && category !== 'All' && ALLOWED_CATEGORIES.includes(category)) {
            query.category = category;
        }
        const products = await Product.find(query);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single product (Public)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid product ID' });
        res.status(500).json({ message: 'Server error' });
    }
});

// Create Product (Admin Only)
router.post('/', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const product = new Product(pickAllowed(req.body));
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error creating product' });
    }
});

// Update Product (Admin Only)
router.put('/:id', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, pickAllowed(req.body), { new: true, runValidators: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid product ID' });
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Delete Product (Admin Only)
router.delete('/:id', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid product ID' });
        res.status(500).json({ message: 'Error deleting product' });
    }
});

// Seed Data (Admin Only)
router.post('/seed', verifyUser, checkRole(['admin']), async (req, res) => {
    try {
        const seedProducts = [
            { name: 'Samosa', description: 'Crispy fried pastry with spiced potato filling', price: 20, category: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60' },
            { name: 'Vada Pav', description: 'Mumbai\'s favorite street food', price: 25, category: 'Snacks', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60' },
            { name: 'Vegetable Sandwich', description: 'Grilled vegetable sandwich', price: 40, category: 'Snacks', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60' },
            { name: 'Veg Thali', description: 'Complete meal with rice, dal, and veggies', price: 80, category: 'Meals', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60' },
            { name: 'Masala Chai', description: 'Spiced Indian tea', price: 15, category: 'Beverages', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60' },
            { name: 'Cold Coffee', description: 'Chilled coffee with ice cream', price: 50, category: 'Beverages', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60' }
        ];

        await Product.deleteMany({});
        await Product.insertMany(seedProducts);
        res.json({ message: 'Data seeded successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Seed error' });
    }
});

module.exports = router;
