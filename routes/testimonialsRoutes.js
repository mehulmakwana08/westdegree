const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const testimonialsController = require('../controllers/testimonialsController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'clientImage') {
            cb(null, 'uploads/testimonials/clients/');
        } else if (file.fieldname === 'companyLogo') {
            cb(null, 'uploads/testimonials/logos/');
        } else {
            cb(null, 'uploads/testimonials/');
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Ensure upload directories exist
const fs = require('fs');
const uploadDirs = [
    'uploads/testimonials',
    'uploads/testimonials/clients',
    'uploads/testimonials/logos'
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Admin routes
router.get('/admin/testimonials', testimonialsController.getAdminTestimonials);
router.post('/admin/testimonials', upload.fields([
    { name: 'clientImage', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 }
]), testimonialsController.createTestimonial);
router.post('/admin/testimonials/:id/update', upload.fields([
    { name: 'clientImage', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 }
]), testimonialsController.updateTestimonial);
router.post('/admin/testimonials/:id/delete', testimonialsController.deleteTestimonial);

// API routes
router.get('/api/testimonials', testimonialsController.getAllTestimonials);
router.get('/api/testimonials/:id', testimonialsController.getTestimonial);
router.get('/api/testimonials/:id/edit', testimonialsController.getTestimonialForEdit);

module.exports = router;