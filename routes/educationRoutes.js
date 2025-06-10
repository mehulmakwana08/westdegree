const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');
const { isAuthenticated } = require('../middleware/auth');

// Admin routes (protected)
router.get('/admin/education', isAuthenticated, educationController.getAdminEducation);
router.post('/admin/education', isAuthenticated, educationController.createEducation);
router.post('/admin/education/:id/update', isAuthenticated, educationController.updateEducation);
router.post('/admin/education/:id/delete', isAuthenticated, educationController.deleteEducation);

// API routes
router.get('/api/education', educationController.getAllEducation);
router.get('/api/education/:id', educationController.getEducation);
router.get('/api/education/:id/edit', educationController.getEducationForEdit);

module.exports = router;