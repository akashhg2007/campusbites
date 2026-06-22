const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyUser, checkRole } = require('../middleware/auth');
const { sendWhatsAppMessage, getMessageTemplate } = require('../utils/whatsapp');
const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
} else {
    console.warn('WARNING: Razorpay keys missing. Payment routes will not function.');
}

// Place Order
router.post('/', verifyUser, async (req, res) => {
    try {
        const { items, totalAmount, pickupTime } = req.body;
        if (!items || !items.length) return res.status(400).json({ message: 'Order must have at least one item' });
        if (!totalAmount || totalAmount <= 0) return res.status(400).json({ message: 'Invalid total amount' });

        const order = new Order({ user: req.user._id, items, totalAmount, pickupTime, loyaltyPointsEarned: Math.floor(totalAmount / 10) });
        await order.save();

        await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: Math.floor(totalAmount / 10), totalOrders: 1 } });

        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { orderCount: item.quantity } });
        }

        const io = req.app.get('io');
        if (io) {
            const populated = await Order.findById(order._id).populate('user', 'name email phone cabinNumber department role').populate('items.product');
            io.to('kitchen').emit('new-order', populated);
        }

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: 'Error placing order' });
    }
});

// Get My Orders
router.get('/mine', verifyUser, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('items.product').sort({ createdAt: -1 });

        const activeOrders = orders.filter(o => ['pending', 'preparing'].includes(o.status));
        const queuedBefore = await Order.countDocuments({ status: { $in: ['pending', 'preparing'] }, createdAt: { $lt: activeOrders[0]?.createdAt || new Date() } });

        const avgPrepTime = 12;
        const enrichedOrders = orders.map(order => {
            const obj = order.toObject();
            if (['pending', 'preparing'].includes(order.status)) {
                obj.queuePosition = queuedBefore + 1;
                obj.estimatedMinutes = (queuedBefore + 1) * avgPrepTime;
            }
            return obj;
        });

        res.json(enrichedOrders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Get single order
router.get('/:id', verifyUser, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product').populate('user', 'name email phone');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (req.user.role === 'student' && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        res.json(order);
    } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid order ID' });
        res.status(500).json({ message: 'Error fetching order' });
    }
});

// Get Active Orders (Staff/Admin)
router.get('/staff/active', verifyUser, checkRole(['admin', 'staff']), async (req, res) => {
    try {
        const orders = await Order.find({ status: { $ne: 'cancelled' } })
            .populate('items.product')
            .populate('user', 'name email phone cabinNumber department role')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching active orders' });
    }
});

// Update Order Status (Staff/Admin)
router.put('/:id/status', verifyUser, checkRole(['admin', 'staff']), async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

        let update = { $set: { status } };
        if (status === 'completed') {
            update.$set.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        } else {
            update.$unset = { expiresAt: '' };
        }

        const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true }).populate('user', 'name phone');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.user && order.user.phone) {
            const message = getMessageTemplate(status, order);
            sendWhatsAppMessage(order.user.phone, message);
        }

        const io = req.app.get('io');
        if (io) {
            io.to('kitchen').emit('order-updated', order);
            io.to('delivery').emit('order-updated', order);
            if (order.user) io.to(`user-${order.user._id}`).emit('order-status-changed', { orderId: order._id, status: order.status });
        }

        res.json(order);
    } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid order ID' });
        res.status(500).json({ message: 'Error updating order status' });
    }
});

// Create Razorpay Order
router.post('/razorpay', verifyUser, async (req, res) => {
    if (!razorpay) return res.status(503).json({ message: 'Payment gateway not configured' });
    try {
        const { amount } = req.body;
        if (!amount || typeof amount !== 'number' || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
        res.status(500).json({ message: 'Error creating payment order' });
    }
});

// Verify Payment
router.post('/verify', verifyUser, async (req, res) => {
    if (!razorpay) return res.status(503).json({ message: 'Payment gateway not configured' });
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment verification data' });
        }

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        if (!orderData || !orderData.items || !orderData.items.length) {
            return res.status(400).json({ message: 'Missing order data' });
        }

        // Recalculate total from products server-side instead of trusting client
        let serverTotal = 0;
        for (const item of orderData.items) {
            const product = await Product.findById(item.product);
            if (!product) return res.status(400).json({ message: `Product not found: ${item.product}` });
            serverTotal += product.price * item.quantity;
        }
        const taxAmount = Math.round(serverTotal * 0.05);
        const donation = orderData.donation || 0;
        const finalTotal = serverTotal + taxAmount + donation;

        const order = new Order({
            user: req.user._id,
            items: orderData.items.map(i => ({ product: i.product, quantity: i.quantity, price: i.price })),
            totalAmount: finalTotal,
            pickupTime: orderData.pickupTime,
            orderType: orderData.orderType || 'pickup',
            deliveryType: orderData.deliveryType || 'pickup',
            cabinNumber: orderData.cabinNumber || '',
            paymentStatus: 'paid',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        await order.save();

        const io = req.app.get('io');
        if (io) {
            const populated = await Order.findById(order._id).populate('user', 'name email phone cabinNumber department role').populate('items.product');
            io.to('kitchen').emit('new-order', populated);
        }

        res.status(200).json({ message: 'Payment verified successfully', order });
    } catch (err) {
        console.error('Verification Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delivery: Active orders
router.get('/delivery/active', verifyUser, checkRole(['delivery', 'admin', 'staff']), async (req, res) => {
    try {
        const orders = await Order.find({ status: { $in: ['ready', 'preparing', 'pending'] } })
            .populate('items.product', 'name price image category')
            .populate('user', 'name email phone cabinNumber department role')
            .sort({ createdAt: 1 });
        const deliveryOrders = orders.filter(order => order.deliveryType === 'cabin' || (order.cabinNumber && order.cabinNumber.trim() !== ''));
        res.json(deliveryOrders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching delivery orders' });
    }
});

// Delivery: Mark as delivered
router.put('/delivery/:id/complete', verifyUser, checkRole(['delivery', 'admin', 'staff']), async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { status: 'completed', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } },
            { new: true }
        ).populate('user', 'name phone');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.user && order.user.phone) {
            const message = getMessageTemplate('delivered', order);
            sendWhatsAppMessage(order.user.phone, message);
        }

        const io = req.app.get('io');
        if (io) {
            io.to('kitchen').emit('order-updated', order);
            io.to('delivery').emit('order-updated', order);
            if (order.user) io.to(`user-${order.user._id}`).emit('order-status-changed', { orderId: order._id, status: 'completed' });
        }

        res.json({ message: 'Order marked as delivered', order });
    } catch (err) {
        if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid order ID' });
        res.status(500).json({ message: 'Error completing order' });
    }
});

module.exports = router;
