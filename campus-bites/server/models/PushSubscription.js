const mongoose = require('mongoose');

const PushSubscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    endpoint: { type: String, required: true },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
    }
}, { timestamps: true });

PushSubscriptionSchema.index({ user: 1 });
PushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });

module.exports = mongoose.model('PushSubscription', PushSubscriptionSchema);
