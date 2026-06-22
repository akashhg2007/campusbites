const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, enum: ['Snacks', 'Meals', 'Beverages', 'Combos', 'Desserts'] },
    image: { type: String, default: 'https://via.placeholder.com/150' },
    isAvailable: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: true },
    stock: { type: Number, default: -1 },
    prepTimeMinutes: { type: Number, default: 10 },
    orderCount: { type: Number, default: 0 },
    tags: [{ type: String }]
}, { timestamps: true });

ProductSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model('Product', ProductSchema);
