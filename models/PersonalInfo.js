const mongoose = require('mongoose');

const personalInfoSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    logo: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },    socialLinks: [{
        name: {
            type: String,
            required: function() {
                // Only require name if this socialLink has any data
                return this.url || this.icon;
            }
        },
        url: {
            type: String,
            required: function() {
                // Only require url if this socialLink has any data
                return this.name || this.icon;
            }
        },
        icon: {
            type: String, // Path to uploaded SVG icon
            required: false // Icon is optional
        }
    }],
    cvFile: {
        type: String,
        required: true
    },
    yearsOfExperience: {
        type: Number,
        required: true
    },
    projectsCompleted: {
        type: Number,
        required: true
    },
    happyClients: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PersonalInfo', personalInfoSchema);