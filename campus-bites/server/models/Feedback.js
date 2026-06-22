const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 500 },
    tags: [{ type: String }],
    images: [{ type: String }]
}, { timestamps: true });

FeedbackSchema.index({ order: 1 }, { unique: true });
FeedbackSchema.index({ 'rating': 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
