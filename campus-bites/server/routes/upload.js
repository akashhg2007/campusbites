const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyUser, checkRole } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', verifyUser, checkRole(['admin']), upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No image provided or invalid format' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, message: 'Image uploaded successfully' });
});

router.post('/bulk-csv', verifyUser, checkRole(['admin']), upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No CSV file provided' });

    try {
        const csv = require('csv-parser');
        const Product = require('../models/Product');
        const results = [];
        const errors = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => results.push(row))
            .on('end', async () => {
                for (let i = 0; i < results.length; i++) {
                    const row = results[i];
                    try {
                        if (!row.name || !row.price || !row.category) {
                            errors.push({ row: i + 1, error: 'Missing required fields (name, price, category)' });
                            continue;
                        }
                        await Product.create({
                            name: row.name.trim(),
                            description: row.description || '',
                            price: parseFloat(row.price),
                            category: row.category.trim(),
                            image: row.image || 'https://via.placeholder.com/150',
                            isVeg: row.isVeg !== 'false',
                            prepTimeMinutes: parseInt(row.prepTimeMinutes) || 10,
                            tags: row.tags ? row.tags.split(',').map(t => t.trim()) : []
                        });
                    } catch (err) {
                        errors.push({ row: i + 1, error: err.message });
                    }
                }

                fs.unlinkSync(req.file.path);
                res.json({
                    message: `Imported ${results.length - errors.length} products`,
                    total: results.length,
                    success: results.length - errors.length,
                    errors
                });
            });
    } catch (err) {
        res.status(500).json({ message: 'Error processing CSV' });
    }
});

module.exports = router;
