const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { verifyUser } = require('../middleware/auth');

const groups = new Map();

router.post('/create', verifyUser, (req, res) => {
    const code = uuidv4().slice(0, 6).toUpperCase();
    groups.set(code, {
        code,
        host: req.user._id.toString(),
        members: [{ userId: req.user._id.toString(), name: req.user.name, items: [] }],
        createdAt: Date.now()
    });
    setTimeout(() => groups.delete(code), 3600000);
    res.json({ code, message: 'Share this code with friends' });
});

router.post('/join', verifyUser, (req, res) => {
    const { code } = req.body;
    const group = groups.get(code?.toUpperCase());
    if (!group) return res.status(404).json({ message: 'Group not found or expired' });
    if (group.members.find(m => m.userId === req.user._id.toString())) {
        return res.json(group);
    }
    group.members.push({ userId: req.user._id.toString(), name: req.user.name, items: [] });
    const io = req.app.get('io');
    if (io) io.to(`group-${code}`).emit('group-updated', group);
    res.json(group);
});

router.post('/add-item', verifyUser, (req, res) => {
    const { code, item } = req.body;
    const group = groups.get(code?.toUpperCase());
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const member = group.members.find(m => m.userId === req.user._id.toString());
    if (!member) return res.status(403).json({ message: 'Not a member of this group' });
    member.items.push(item);
    const io = req.app.get('io');
    if (io) io.to(`group-${code}`).emit('group-updated', group);
    res.json(group);
});

router.get('/:code', verifyUser, (req, res) => {
    const group = groups.get(req.params.code.toUpperCase());
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
});

module.exports = router;
