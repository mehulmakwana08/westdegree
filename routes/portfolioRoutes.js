const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const portfolioController = require('../controllers/portfolioController');
const logger = require('../utils/logger');

// Ensure upload directories exist
const uploadDirs = [
    'uploads/portfolio',
    'uploads/portfolio/gallery'
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
    }
});

// Configure multer for portfolio file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'image') {
            cb(null, 'uploads/portfolio/');
        } else if (file.fieldname === 'galleryImages') {
            cb(null, 'uploads/portfolio/gallery/');
        } else {
            cb(null, 'uploads/portfolio/');
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check if the file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Handle multiple file uploads
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
]);

// API Routes for Portfolio
router.get('/api/portfolio', portfolioController.getPortfolios);
router.get('/api/portfolio/:id', portfolioController.getPortfolio);
router.post('/api/portfolio', uploadFields, portfolioController.createPortfolio);
router.put('/api/portfolio/:id', uploadFields, portfolioController.updatePortfolio);
router.delete('/api/portfolio/:id', portfolioController.deletePortfolio);

// Admin Routes for Portfolio Management
router.get('/admin/portfolio', portfolioController.getAdminPortfolios);
router.post('/admin/portfolio', uploadFields, portfolioController.createPortfolio);
router.post('/admin/portfolio/:id/update', uploadFields, portfolioController.updatePortfolio);
router.post('/admin/portfolio/:id/delete', portfolioController.deletePortfolio);

module.exports = router;