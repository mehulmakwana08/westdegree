const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Create a Winston logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'info'),
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { 
        service: 'dynamic-portfolio',
        environment: process.env.NODE_ENV || 'development'
    },
    transports: [
        // Always add console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
                })
            )
        })
    ]
});

// Add file transports only in non-serverless environments
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '..', 'logs');
    
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    // Add file transports
    logger.add(new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
        )
    }));

    logger.add(new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    }));
}

module.exports = logger;