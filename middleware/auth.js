const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const isAuthenticated = (req, res, next) => {
    // Check if user is authenticated
    if (req.session.isAuthenticated) {
        res.locals.user = req.session.user; // Make user data available to views
        return next();
    }
    // If not authenticated, redirect to login
    res.redirect('/admin/login');
};

const isNotAuthenticated = (req, res, next) => {
    // Check if user is not authenticated (for login page)
    if (!req.session.isAuthenticated) {
        return next();
    }
    // If authenticated, redirect to dashboard
    res.redirect('/admin/dashboard');
};

// JWT middleware for API routes
const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Verify token
        const decoded = User.verifyToken(token);
        
        // Find user in database
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Add user to request object
        req.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        logger.error('JWT authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Hybrid middleware that checks both session and JWT
const authenticateHybrid = async (req, res, next) => {
    // First check session authentication (for web routes)
    if (req.session.isAuthenticated) {
        res.locals.user = req.session.user;
        return next();
    }

    // Then check JWT authentication (for API routes)
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = User.verifyToken(token);
            const user = await User.findById(decoded.id);
            
            if (user && user.isActive) {
                req.user = {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                };
                res.locals.user = req.user;
                return next();
            }
        }
    } catch (error) {
        logger.error('Hybrid authentication error:', error);
    }

    // If neither authentication method works
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    } else {
        return res.redirect('/admin/login');
    }
};

module.exports = {
    isAuthenticated,
    isNotAuthenticated,
    authenticateJWT,
    authenticateHybrid
};