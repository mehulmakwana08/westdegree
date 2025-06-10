const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true // Main portfolio image
    },
    galleryImages: [{
        type: String // Array of gallery image paths
    }],
    shortDescription: {
        type: String,
        required: true,
        trim: true
    },
    longDescription: {
        type: String,
        required: true,
        trim: true
    },    category: {
        type: String,
        required: true,
        enum: ['uxui', 'branding', 'mobile-app', 'web-design', 'graphics'],
        default: 'web-design'
    },
    order: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Add index for better query performance
portfolioSchema.index({ order: 1, createdAt: -1 });
portfolioSchema.index({ isActive: 1 });
portfolioSchema.index({ category: 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);