const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const { verifyUser } = require('../middleware/auth');

router.get('/', verifyUser, async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, updatedAt: -1 });
        res.json(addresses);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching addresses' });
    }
});

router.post('/', verifyUser, async (req, res) => {
    try {
        const { label, type, building, floor, roomNumber, landmark, isDefault } = req.body;
        if (!label) return res.status(400).json({ message: 'Label is required' });

        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        const address = new Address({
            user: req.user._id, label, type, building: building || '',
            floor: floor || '', roomNumber: roomNumber || '',
            landmark: landmark || '', isDefault: isDefault || false
        });
        await address.save();
        res.status(201).json(address);
    } catch (err) {
        res.status(500).json({ message: 'Error creating address' });
    }
});

router.put('/:id', verifyUser, async (req, res) => {
    try {
        const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
        if (!address) return res.status(404).json({ message: 'Address not found' });

        if (req.body.isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        Object.assign(address, req.body);
        await address.save();
        res.json(address);
    } catch (err) {
        res.status(500).json({ message: 'Error updating address' });
    }
});

router.delete('/:id', verifyUser, async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!address) return res.status(404).json({ message: 'Address not found' });
        res.json({ message: 'Address deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting address' });
    }
});

module.exports = router;
