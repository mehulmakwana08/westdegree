const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

exports.getLogin = (req, res) => {
    logger.info('Login page accessed');
    if (req.session.isAuthenticated) {
        logger.info('User already authenticated, redirecting to dashboard');
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', {
        title: 'Admin Login - Portfolio',
        error: req.query.error || null
    });
};

exports.postLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        logger.info(`Login attempt for username: ${username}`);
        
        // Validate input
        if (!username || !password) {
            logger.warn('Missing username or password');
            return res.redirect('/admin/login?error=Username and password are required');
        }
        
        // Find user by username or email
        const user = await User.findOne({
            $or: [
                { username: username.trim() },
                { email: username.trim().toLowerCase() }
            ]
        });

        if (!user) {
            logger.warn(`Failed login attempt - user not found: ${username}`);
            return res.redirect('/admin/login?error=Invalid credentials');
        }

        logger.info(`User found: ${user.username}`);
          // Use the User model's comparePassword method
        const isValidPassword = await user.comparePassword(password.trim());
        
        if (!isValidPassword) {
            logger.warn(`Failed login attempt - invalid password for user: ${username}`);
            return res.redirect('/admin/login?error=Invalid credentials');
        }

        // Generate JWT token
        const token = user.generateAuthToken();

        // Set session and JWT token
        req.session.isAuthenticated = true;
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        req.session.token = token;

        logger.info(`Successful login for user: ${username}`);
        
        // For API requests, return JSON with token
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({
                success: true,
                message: 'Login successful',
                token: token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        }
        
        res.redirect('/admin/dashboard');
    } catch (error) {
        logger.error('Login error:', error);
        res.redirect('/admin/login?error=An error occurred');
    }
};

exports.logout = (req, res) => {
    const username = req.session?.user?.username;
    req.session.destroy((err) => {
        if (err) {
            logger.error('Error destroying session:', err);
        }
        logger.info(`User logged out: ${username || 'Unknown user'}`);
        res.redirect('/admin/login');
    });
};

// Registration route for testing (optional)
exports.postRegister = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        logger.info(`Registration attempt for username: ${username}`);
        
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { username: username.trim() },
                { email: email.trim().toLowerCase() }
            ]
        });

        if (existingUser) {
            logger.warn(`Registration failed - user already exists: ${username}`);
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create new user
        const user = new User({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: password.trim(),
            role: 'admin'
        });

        await user.save();

        // Generate JWT token
        const token = user.generateAuthToken();

        logger.info(`User registered successfully: ${username}`);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during registration'
        });
    }
};