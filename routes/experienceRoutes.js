const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');
const { isAuthenticated } = require('../middleware/auth');

// Admin routes (protected)
router.get('/admin/experience', isAuthenticated, experienceController.getAdminExperiences);
router.post('/admin/experience', isAuthenticated, experienceController.createExperience);
router.post('/admin/experience/:id/update', isAuthenticated, experienceController.updateExperience);
router.post('/admin/experience/:id/delete', isAuthenticated, experienceController.deleteExperience);

// API routes
router.get('/api/experience', experienceController.getAllExperiences);
router.get('/api/experience/:id', experienceController.getExperience);
router.get('/api/experience/:id/edit', experienceController.getExperienceForEdit);

module.exports = router;