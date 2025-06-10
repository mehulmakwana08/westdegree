const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    degree: {
        type: String,
        required: true,
        trim: true
    },
    institution: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    startYear: {
        type: String,
        required: true
    },
    endYear: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
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
educationSchema.index({ order: 1, endYear: -1 });
educationSchema.index({ isActive: 1 });

module.exports = mongoose.model('Education', educationSchema);