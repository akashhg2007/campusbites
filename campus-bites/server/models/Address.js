const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, required: true, trim: true },
    type: { type: String, enum: ['cabin', 'hostel', 'library', 'other'], default: 'cabin' },
    building: { type: String, default: '' },
    floor: { type: String, default: '' },
    roomNumber: { type: String, default: '' },
    landmark: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    }
}, { timestamps: true });

AddressSchema.index({ user: 1, isDefault: -1 });

module.exports = mongoose.model('Address', AddressSchema);
