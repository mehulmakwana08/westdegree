const Service = require('../models/Service');
const logger = require('../utils/logger');

// Get all services for admin view
exports.getAdminServices = async (req, res) => {
    try {
        logger.info('Loading admin services page');
        const services = await Service.find().sort({ order: 1, createdAt: 1 });
        
        // Check for success or error messages in query parameters
        const successMessage = req.query.success;
        const errorMessage = req.query.error;
        
        logger.info(`Loaded ${services.length} services for admin view`);
        res.render('admin/services', {
            title: 'Services Management - Admin',
            services: services || [],
            success: successMessage === 'true',
            updated: req.query.updated === 'true',
            deleted: req.query.deleted === 'true',
            errorMessage: errorMessage
        });
    } catch (error) {
        logger.error('Error loading services page:', error);
        res.status(500).render('error', {
            message: 'Error loading services',
            error: error
        });
    }
};

// Get all services (API endpoint)
exports.getAllServices = async (req, res) => {
    try {
        logger.info('Fetching all services');
        const services = await Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        logger.info(`Fetched ${services.length} active services`);
        res.json(services);
    } catch (error) {
        logger.error('Error fetching services:', error);
        res.status(500).json({ message: 'Error fetching services', error: error.message });
    }
};

// Get single service
exports.getService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            logger.warn(`Service not found: ${req.params.id}`);
            return res.status(404).json({ message: 'Service not found' });
        }
        logger.info(`Service fetched: ${service.title}`);
        res.json(service);
    } catch (error) {
        logger.error('Error fetching service:', error);
        res.status(500).json({ message: 'Error fetching service', error: error.message });
    }
};

// Create new service
exports.createService = async (req, res) => {
    try {
        logger.info('Creating new service');
        const { number, title, description, icon, order, isActive } = req.body;
        
        // Validate required fields
        if (!number || !title || !description) {
            return res.status(400).json({ 
                message: 'Number, title, and description are required' 
            });
        }
          const service = new Service({
            number: number.trim(),
            title: title.trim(),
            description: description.trim(),
            icon: icon ? icon.trim() : '',
            order: order || 1,
            isActive: isActive === 'on' ? true : (isActive !== undefined ? isActive : true)
        });
        
        await service.save();
        logger.info(`Service created successfully: ${service.title}`);
        
        // For API requests, return JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(201).json(service);
        }
        
        // For web requests, redirect with success message
        return res.redirect('/admin/services?success=true');
    } catch (error) {
        logger.error('Error creating service:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error creating service', error: error.message });
        }
        
        return res.redirect('/admin/services?error=Failed to create service');
    }
};

// Update service
exports.updateService = async (req, res) => {
    try {
        logger.info(`Updating service: ${req.params.id}`);
        const { number, title, description, icon, order, isActive } = req.body;
        
        // Validate required fields
        if (!number || !title || !description) {
            return res.status(400).json({ 
                message: 'Number, title, and description are required' 
            });
        }
          const updateData = {
            number: number.trim(),
            title: title.trim(),
            description: description.trim(),
            icon: icon ? icon.trim() : '',
            order: order || 1,
            isActive: isActive === 'on' ? true : (isActive !== undefined ? isActive : true)
        };
        
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!service) {
            logger.warn(`Service not found for update: ${req.params.id}`);
            return res.status(404).json({ message: 'Service not found' });
        }
        
        logger.info(`Service updated successfully: ${service.title}`);
        
        // For API requests, return JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(service);
        }
        
        // For web requests, redirect with success message
        return res.redirect('/admin/services?updated=true');
    } catch (error) {
        logger.error('Error updating service:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error updating service', error: error.message });
        }
        
        return res.redirect('/admin/services?error=Failed to update service');
    }
};

// Delete service
exports.deleteService = async (req, res) => {
    try {
        logger.info(`Deleting service: ${req.params.id}`);
        
        const service = await Service.findByIdAndDelete(req.params.id);
        
        if (!service) {
            logger.warn(`Service not found for deletion: ${req.params.id}`);
            return res.status(404).json({ message: 'Service not found' });
        }
        
        logger.info(`Service deleted successfully: ${service.title}`);
        
        // For API requests, return JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ message: 'Service deleted successfully' });
        }
        
        // For web requests, redirect with success message
        return res.redirect('/admin/services?deleted=true');
    } catch (error) {
        logger.error('Error deleting service:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error deleting service', error: error.message });
        }
        
        return res.redirect('/admin/services?error=Failed to delete service');
    }
};