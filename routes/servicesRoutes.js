const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');
const logger = require('../utils/logger');

// API Routes
router.get('/api/services', servicesController.getAllServices);
router.get('/api/services/:id', servicesController.getService);
router.post('/api/services', servicesController.createService);
router.put('/api/services/:id', servicesController.updateService);
router.delete('/api/services/:id', servicesController.deleteService);

// Admin Routes
router.get('/admin/services', servicesController.getAdminServices);
router.post('/admin/services', servicesController.createService);
router.post('/admin/services/:id/update', servicesController.updateService);
router.post('/admin/services/:id/delete', servicesController.deleteService);

module.exports = router;