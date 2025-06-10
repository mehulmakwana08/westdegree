    const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        default: 'Present'
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
experienceSchema.index({ order: 1, startDate: -1 });
experienceSchema.index({ isActive: 1 });

module.exports = mongoose.model('Experience', experienceSchema);