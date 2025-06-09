const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const personalInfoController = require('../controllers/personalInfoController');
const logger = require('../utils/logger');

// Configure multer for handling multiple file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            let uploadPath = 'uploads/';
            if (file.fieldname === 'logo') {
                uploadPath += 'logos/';
            } else if (file.fieldname === 'profileImage') {
                uploadPath += 'profiles/';
            } else if (file.fieldname === 'cvFile') {
                uploadPath += 'cvs/';
            } else if (file.fieldname.startsWith('socialIcon')) {
                uploadPath += 'social-icons/';
            }
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    fileFilter: function (req, file, cb) {
        // Allow SVG files for social icons
        if (file.fieldname.startsWith('socialIcon')) {
            if (file.mimetype === 'image/svg+xml') {
                cb(null, true);
            } else {
                cb(new Error('Only SVG files are allowed for social icons'), false);
            }
        } else {
            cb(null, true);
        }
    }
});

// Use dynamic field handling for social icons
const handleMultipleFields = upload.any();

// API Routes
router.get('/api/personal-info', personalInfoController.getPersonalInfo);
router.put('/api/personal-info', handleMultipleFields, personalInfoController.updatePersonalInfo);

// Admin Routes
router.get('/admin/personal-info', personalInfoController.getAdminPersonalInfo);
router.post('/admin/personal-info', handleMultipleFields, personalInfoController.updatePersonalInfo);

module.exports = router;