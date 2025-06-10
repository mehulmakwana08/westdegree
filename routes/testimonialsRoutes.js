const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const testimonialsController = require('../controllers/testimonialsController');
const { isAuthenticated } = require('../middleware/auth');

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

// Configure multer for testimonial file uploads
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
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Handle multiple file uploads
const uploadFields = upload.fields([
    { name: 'clientImage', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 }
]);

// Admin routes (protected)
router.get('/admin/testimonials', isAuthenticated, testimonialsController.getAdminTestimonials);
router.post('/admin/testimonials', isAuthenticated, uploadFields, testimonialsController.createTestimonial);
router.post('/admin/testimonials/:id/update', isAuthenticated, uploadFields, testimonialsController.updateTestimonial);
router.post('/admin/testimonials/:id/delete', isAuthenticated, testimonialsController.deleteTestimonial);

// API routes
router.get('/api/testimonials', testimonialsController.getAllTestimonials);
router.get('/api/testimonials/:id', testimonialsController.getTestimonial);
router.post('/api/testimonials', uploadFields, testimonialsController.createTestimonial);
router.put('/api/testimonials/:id', uploadFields, testimonialsController.updateTestimonial);
router.delete('/api/testimonials/:id', testimonialsController.deleteTestimonial);

module.exports = router;