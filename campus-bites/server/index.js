require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { message: 'Too many requests, please try again after 15 minutes' }
});
app.use('/api/', apiLimiter);

app.set('io', io);

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus-bites';
if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
    console.error('ERROR: Invalid MONGO_URI format');
    process.exit(1);
}

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000 })
    .then(async () => {
        console.log('MongoDB Connected');
        try {
            const User = require('./models/User');
            const seedData = [
                { name: 'Admin User', email: 'admin@bites.com', password: 'admin123', role: 'admin' },
                { name: 'Staff User', email: 'staff@bites.com', password: 'staff123', role: 'staff' },
                { name: 'Delivery Boy', email: 'delivery@bites.com', password: 'delivery123', role: 'delivery' },
                { name: 'Student User', email: 'student@bites.com', password: 'student123', role: 'student' }
            ];
            for (const u of seedData) {
                const exists = await User.findOne({ email: u.email });
                if (!exists) { await new User(u).save(); console.log(`Seeded ${u.role}: ${u.email}`); }
            }
        } catch (err) { console.error('Auto-seeding failed:', err.message); }
    })
    .catch(err => { console.error('MongoDB Connection Error:', err.message); process.exit(1); });

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join-kitchen', () => socket.join('kitchen'));
    socket.on('join-delivery', () => socket.join('delivery'));
    socket.on('join-user', (userId) => socket.join(`user-${userId}`));
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

app.get('/', (req, res) => {
    res.json({ message: 'Campus Bites API is running', dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/loyalty', require('./routes/loyalty'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/upi', require('./routes/upi'));
app.use('/api/recurring', require('./routes/recurring'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/push', require('./routes/push'));
app.use('/api/admin/users', require('./routes/adminUsers'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { setupWhatsAppBridge } = require('./utils/whatsappBridge');
setupWhatsAppBridge(io);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ message: 'Internal server error' }); });

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
