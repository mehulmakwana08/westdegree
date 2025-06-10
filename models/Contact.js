const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    service: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    replied: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for better query performance
contactSchema.index({ createdAt: -1 });
contactSchema.index({ isRead: 1 });

module.exports = mongoose.model('Contact', contactSchema);