const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
    const payload = {
        id: this._id,
        username: this.username,
        email: this.email,
        role: this.role
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'gerold-portfolio-jwt-secret', {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
};

// Static method to verify JWT token
userSchema.statics.verifyToken = function(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'gerold-portfolio-jwt-secret');
    } catch (error) {
        throw new Error('Invalid token');
    }
};

module.exports = mongoose.model('User', userSchema);