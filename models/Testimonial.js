const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    testimonialText: {
        type: String,
        required: true
    },
    clientImage: {
        type: String,
        default: ''
    },
    companyLogo: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
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

module.exports = mongoose.model('Testimonial', testimonialSchema);