const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Function to create upload directories
function createUploadDirectories() {
    const uploadDirs = [
        'uploads',
        'uploads/logos',
        'uploads/profiles',
        'uploads/cvs',
        'uploads/portfolios',
        'uploads/skills',
        'uploads/social-icons',
        'uploads/testimonials',
        'uploads/testimonials/clients',
        'uploads/testimonials/logos'
    ];

    uploadDirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        if (!fs.existsSync(dirPath)) {
            try {
                fs.mkdirSync(dirPath, { recursive: true });
                logger.info(`Created directory: ${dirPath}`);
            } catch (error) {
                logger.error(`Failed to create directory ${dirPath}:`, error.message);
            }
        }
    });
}

module.exports = {
    createUploadDirectories
};