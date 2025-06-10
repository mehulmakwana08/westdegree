const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');
const { isAuthenticated } = require('../middleware/auth');

// Admin routes (protected)
router.get('/admin/contacts', isAuthenticated, contactsController.getAdminContacts);
router.get('/admin/contacts/:id', isAuthenticated, contactsController.getAdminContact);
router.post('/admin/contacts/:id/update', isAuthenticated, contactsController.updateContact);
router.post('/admin/contacts/:id/delete', isAuthenticated, contactsController.deleteContact);
router.post('/admin/contacts/mark-read', isAuthenticated, contactsController.markAsRead);
router.post('/admin/contacts/bulk-delete', isAuthenticated, contactsController.bulkDeleteContacts);

// API routes
router.get('/api/contacts', contactsController.getAllContacts);
router.get('/api/contacts/stats', contactsController.getContactStats);
router.get('/api/contacts/:id', contactsController.getContact);
router.post('/api/contacts', contactsController.createContact);
router.put('/api/contacts/:id', contactsController.updateContact);
router.delete('/api/contacts/:id', contactsController.deleteContact);

// Public contact form submission route
router.post('/contact', contactsController.createContact);

module.exports = router;