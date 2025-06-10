const Contact = require('../models/Contact');
const logger = require('../utils/logger');

// Get all contacts for admin view
exports.getAdminContacts = async (req, res) => {
    try {
        logger.info('Loading admin contacts page');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Get filter parameters
        const filter = {};
        if (req.query.status === 'read') filter.isRead = true;
        if (req.query.status === 'unread') filter.isRead = false;
        if (req.query.service && req.query.service !== 'all') filter.service = req.query.service;
        
        const contacts = await Contact.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        const totalContacts = await Contact.countDocuments(filter);
        const totalPages = Math.ceil(totalContacts / limit);
        
        // Get statistics
        const stats = {
            total: await Contact.countDocuments(),
            unread: await Contact.countDocuments({ isRead: false }),
            read: await Contact.countDocuments({ isRead: true }),
            replied: await Contact.countDocuments({ replied: true })
        };
        
        const successMessage = req.query.success;
        const errorMessage = req.query.error;
        
        logger.info(`Loaded ${contacts.length} contacts for admin view (page ${page})`);
        res.render('admin/contacts', {
            title: 'Contact Management - Admin',
            contacts: contacts || [],
            stats,
            pagination: {
                current: page,
                total: totalPages,
                limit,
                totalContacts
            },
            filters: {
                status: req.query.status || 'all',
                service: req.query.service || 'all'
            },
            success: successMessage === 'true',
            updated: req.query.updated === 'true',
            deleted: req.query.deleted === 'true',
            errorMessage: errorMessage
        });
    } catch (error) {
        logger.error('Error loading contacts page:', error);
        res.status(500).render('error', {
            message: 'Error loading contacts',
            error: error
        });
    }
};

// Get all contacts (API endpoint)
exports.getAllContacts = async (req, res) => {
    try {
        logger.info('Fetching all contacts');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const contacts = await Contact.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        const total = await Contact.countDocuments();
        
        logger.info(`Fetched ${contacts.length} contacts`);
        res.json({
            contacts,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                limit,
                totalContacts: total
            }
        });
    } catch (error) {
        logger.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'Error fetching contacts', error: error.message });
    }
};

// Get single contact
exports.getContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            logger.warn(`Contact not found: ${req.params.id}`);
            return res.status(404).json({ message: 'Contact not found' });
        }
        
        // Mark as read when viewed
        if (!contact.isRead) {
            contact.isRead = true;
            await contact.save();
            logger.info(`Contact marked as read: ${contact._id}`);
        }
        
        logger.info(`Contact fetched: ${contact.firstName} ${contact.lastName}`);
        res.json(contact);
    } catch (error) {
        logger.error('Error fetching contact:', error);
        res.status(500).json({ message: 'Error fetching contact', error: error.message });
    }
};

// Create new contact (from contact form)
exports.createContact = async (req, res) => {
    try {
        logger.info('Creating new contact from form submission');
        const { name, email, subject, message, conLName, conPhone, conService } = req.body;
        
        // Handle both old and new form field names
        const firstName = req.body.conName || name || req.body.firstName;
        const lastName = conLName || req.body.lastName || '';
        const contactEmail = req.body.conEmail || email;
        const contactMessage = req.body.conMessage || message;
        const phone = conPhone || req.body.phone || '';
        const service = conService || req.body.service || '';
        
        if (!firstName || !contactEmail || !contactMessage) {
            return res.status(400).json({ 
                success: false,
                message: 'Name, email, and message are required' 
            });
        }
        
        const contact = new Contact({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: contactEmail.trim().toLowerCase(),
            phone: phone.trim(),
            service: service.trim(),
            message: contactMessage.trim()
        });
        
        await contact.save();
        logger.info(`Contact created successfully: ${contact.firstName} ${contact.lastName} (${contact.email})`);
        
        // For API requests, return JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(201).json({
                success: true,
                message: 'Contact saved successfully',
                contact: contact
            });
        }
        
        // For web requests, redirect with success message
        return res.redirect('/?success=true');
    } catch (error) {
        logger.error('Error creating contact:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ 
                success: false,
                message: 'Error saving contact', 
                error: error.message 
            });
        }
        
        return res.redirect('/?error=Failed to send message');
    }
};

// Update contact (mark as read/replied, add notes)
exports.updateContact = async (req, res) => {
    try {
        logger.info(`Updating contact: ${req.params.id}`);
        const { isRead, replied, notes } = req.body;
        
        const updateData = {};
        if (isRead !== undefined) updateData.isRead = isRead === 'true' || isRead === true;
        if (replied !== undefined) updateData.replied = replied === 'true' || replied === true;
        if (notes !== undefined) updateData.notes = notes.trim();
        
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!contact) {
            logger.warn(`Contact not found for update: ${req.params.id}`);
            return res.status(404).json({ message: 'Contact not found' });
        }
        
        logger.info(`Contact updated successfully: ${contact.firstName} ${contact.lastName}`);
        
        // For API requests, return JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(contact);
        }
        
        // For web requests, redirect with success message
        return res.redirect('/admin/contacts?updated=true');
    } catch (error) {
        logger.error('Error updating contact:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error updating contact', error: error.message });
        }
        
        return res.redirect('/admin/contacts?error=Failed to update contact');
    }
};

// Delete contact
exports.deleteContact = async (req, res) => {
    try {
        logger.info(`Deleting contact: ${req.params.id}`);
        
        const contact = await Contact.findByIdAndDelete(req.params.id);
        
        if (!contact) {
            logger.warn(`Contact not found for deletion: ${req.params.id}`);
            return res.status(404).json({ message: 'Contact not found' });
        }
        
        logger.info(`Contact deleted successfully: ${contact.firstName} ${contact.lastName}`);
        
        // For API requests, return JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ message: 'Contact deleted successfully' });
        }
        
        // For web requests, redirect with success message
        return res.redirect('/admin/contacts?deleted=true');
    } catch (error) {
        logger.error('Error deleting contact:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error deleting contact', error: error.message });
        }
        
        return res.redirect('/admin/contacts?error=Failed to delete contact');
    }
};

// Mark multiple contacts as read
exports.markAsRead = async (req, res) => {
    try {
        const { contactIds } = req.body;
        
        if (!contactIds || !Array.isArray(contactIds)) {
            return res.status(400).json({ message: 'Contact IDs are required' });
        }
        
        await Contact.updateMany(
            { _id: { $in: contactIds } },
            { isRead: true }
        );
        
        logger.info(`Marked ${contactIds.length} contacts as read`);
        res.json({ message: `${contactIds.length} contacts marked as read` });
    } catch (error) {
        logger.error('Error marking contacts as read:', error);
        res.status(500).json({ message: 'Error marking contacts as read', error: error.message });
    }
};

// Bulk delete contacts
exports.bulkDeleteContacts = async (req, res) => {
    try {
        const { contactIds } = req.body;
        
        if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
            return res.status(400).json({ message: 'Contact IDs are required' });
        }
        
        logger.info(`Bulk deleting ${contactIds.length} contacts`);
        
        const result = await Contact.deleteMany({ _id: { $in: contactIds } });
        
        logger.info(`Successfully deleted ${result.deletedCount} contacts`);
        
        // For API requests, return JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ 
                message: `${result.deletedCount} contacts deleted successfully`,
                deletedCount: result.deletedCount
            });
        }
        
        // For web requests, redirect with success message
        return res.redirect('/admin/contacts?deleted=true');
    } catch (error) {
        logger.error('Error bulk deleting contacts:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error deleting contacts', error: error.message });
        }
        
        return res.redirect('/admin/contacts?error=Failed to delete contacts');
    }
};

// Get contact statistics
exports.getContactStats = async (req, res) => {
    try {
        const stats = {
            total: await Contact.countDocuments(),
            unread: await Contact.countDocuments({ isRead: false }),
            read: await Contact.countDocuments({ isRead: true }),
            replied: await Contact.countDocuments({ replied: true }),
            thisMonth: await Contact.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            })
        };
        
        res.json(stats);
    } catch (error) {
        logger.error('Error fetching contact statistics:', error);
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
};

// Get single contact for admin view
exports.getAdminContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            logger.warn(`Contact not found: ${req.params.id}`);
            return res.status(404).render('error', {
                message: 'Contact not found',
                error: { status: 404, stack: '' }
            });
        }
        
        // Mark as read when viewed
        if (!contact.isRead) {
            contact.isRead = true;
            await contact.save();
            logger.info(`Contact marked as read: ${contact._id}`);
        }
        
        logger.info(`Contact viewed by admin: ${contact.firstName} ${contact.lastName}`);
        res.render('admin/contact-view', {
            title: 'View Contact - Admin',
            contact,
            success: req.query.success === 'true',
            updated: req.query.updated === 'true',
            errorMessage: req.query.error
        });
    } catch (error) {
        logger.error('Error fetching contact for admin view:', error);
        res.status(500).render('error', {
            message: 'Error loading contact',
            error: error
        });
    }
};