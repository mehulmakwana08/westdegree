const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const skillsController = require('../controllers/skillsController');
const { isAuthenticated } = require('../middleware/auth');
const logger = require('../utils/logger');

// Configure multer for skill icon uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/skills/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check if the file is an image or SVG
    if (file.mimetype.startsWith('image/') || file.mimetype === 'image/svg+xml') {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed for skill icons!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// API Routes
router.get('/api/skills', skillsController.getAllSkills);
router.get('/api/skills/:id', skillsController.getSkill);
router.get('/api/skills/:id/edit', skillsController.getSkillForEdit);

// Admin routes (protected)
router.get('/admin/skills', isAuthenticated, skillsController.getAdminSkills);
router.post('/admin/skills', isAuthenticated, upload.single('icon'), skillsController.createSkill);
router.post('/admin/skills/:id/update', isAuthenticated, upload.single('icon'), skillsController.updateSkill);
router.post('/admin/skills/:id/delete', isAuthenticated, skillsController.deleteSkill);

module.exports = router;