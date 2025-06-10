#!/usr/bin/env node

/**
 * Production startup script for Vercel deployment
 * Ensures proper environment configuration and graceful startup
 */

const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Vercel-specific configurations
if (process.env.VERCEL) {
    logger.info('Running on Vercel serverless environment');
    
    // Enable trust proxy for Vercel
    app.set('trust proxy', true);
    
    // Handle Vercel specific headers
    app.use((req, res, next) => {
        // Add Vercel-specific headers
        res.setHeader('X-Powered-By', 'Vercel');
        next();
    });
}

// Graceful shutdown handler
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Global error handlers
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Export for Vercel
module.exports = app;
