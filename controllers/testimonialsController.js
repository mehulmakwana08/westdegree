const Testimonial = require('../models/Testimonial');
const logger = require('../utils/logger');

// Get all testimonials for admin view
exports.getAdminTestimonials = async (req, res) => {
    try {
        logger.info('Loading admin testimonials page');
        const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
        
        const successMessage = req.query.success;
        const errorMessage = req.query.error;
        
        logger.info(`Loaded ${testimonials.length} testimonials for admin view`);
        res.render('admin/testimonials', {
            title: 'Testimonials Management - Admin',
            testimonials: testimonials || [],
            success: successMessage === 'true',
            updated: req.query.updated === 'true',
            deleted: req.query.deleted === 'true',
            errorMessage: errorMessage
        });
    } catch (error) {
        logger.error('Error loading testimonials page:', error);
        res.status(500).render('error', {
            message: 'Error loading testimonials',
            error: error
        });
    }
};

// Get all testimonials (API endpoint)
exports.getAllTestimonials = async (req, res) => {
    try {
        logger.info('Fetching all testimonials');
        const testimonials = await Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        logger.info(`Fetched ${testimonials.length} active testimonials`);
        res.json(testimonials);
    } catch (error) {
        logger.error('Error fetching testimonials:', error);
        res.status(500).json({ message: 'Error fetching testimonials', error: error.message });
    }
};

// Get single testimonial
exports.getTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            logger.warn(`Testimonial not found: ${req.params.id}`);
            return res.status(404).json({ message: 'Testimonial not found' });
        }
        logger.info(`Testimonial fetched: ${testimonial.clientName}`);
        res.json(testimonial);
    } catch (error) {
        logger.error('Error fetching testimonial:', error);
        res.status(500).json({ message: 'Error fetching testimonial', error: error.message });
    }
};

// Get single testimonial for editing
exports.getTestimonialForEdit = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            logger.warn(`Testimonial not found for edit: ${req.params.id}`);
            return res.status(404).json({ message: 'Testimonial not found' });
        }
        logger.info(`Testimonial fetched for edit: ${testimonial.clientName}`);
        res.json(testimonial);
    } catch (error) {
        logger.error('Error fetching testimonial for edit:', error);
        res.status(500).json({ message: 'Error fetching testimonial', error: error.message });
    }
};

// Create new testimonial
exports.createTestimonial = async (req, res) => {
    try {
        logger.info('Creating new testimonial');
        const { clientName, designation, company, testimonialText, rating, order, isActive } = req.body;
        
        if (!clientName || !designation || !company || !testimonialText) {
            return res.status(400).json({ 
                message: 'Client name, designation, company, and testimonial text are required' 
            });
        }
        
        const testimonialData = {
            clientName: clientName.trim(),
            designation: designation.trim(),
            company: company.trim(),
            testimonialText: testimonialText.trim(),
            rating: rating || 5,
            order: order || 1,
            isActive: isActive === 'on' ? true : (isActive !== undefined ? isActive : true)
        };        // Handle file uploads if present
        if (req.files) {
            if (req.files.clientImage && req.files.clientImage[0]) {
                testimonialData.clientImage = '/' + req.files.clientImage[0].path.replace(/\\/g, '/');
                logger.info(`Client image uploaded: ${testimonialData.clientImage}`);
            }
            if (req.files.companyLogo && req.files.companyLogo[0]) {
                testimonialData.companyLogo = '/' + req.files.companyLogo[0].path.replace(/\\/g, '/');
                logger.info(`Company logo uploaded: ${testimonialData.companyLogo}`);
            }
        }
        
        const testimonial = new Testimonial(testimonialData);
        await testimonial.save();
        logger.info(`Testimonial created successfully: ${testimonial.clientName} from ${testimonial.company}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(201).json(testimonial);
        }
        
        return res.redirect('/admin/testimonials?success=true');
    } catch (error) {
        logger.error('Error creating testimonial:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error creating testimonial', error: error.message });
        }
        
        return res.redirect('/admin/testimonials?error=Failed to create testimonial');
    }
};

// Update testimonial
exports.updateTestimonial = async (req, res) => {
    try {
        logger.info(`Updating testimonial: ${req.params.id}`);
        const { clientName, designation, company, testimonialText, rating, order, isActive } = req.body;
        
        if (!clientName || !designation || !company || !testimonialText) {
            return res.status(400).json({ 
                message: 'Client name, designation, company, and testimonial text are required' 
            });
        }
        
        const updateData = {
            clientName: clientName.trim(),
            designation: designation.trim(),
            company: company.trim(),
            testimonialText: testimonialText.trim(),
            rating: rating || 5,
            order: order || 1,
            isActive: isActive === 'on' ? true : (isActive !== undefined ? isActive : true)
        };        // Handle file uploads if present
        if (req.files) {
            if (req.files.clientImage && req.files.clientImage[0]) {
                updateData.clientImage = '/' + req.files.clientImage[0].path.replace(/\\/g, '/');
                logger.info(`Client image updated: ${updateData.clientImage}`);
            }
            if (req.files.companyLogo && req.files.companyLogo[0]) {
                updateData.companyLogo = '/' + req.files.companyLogo[0].path.replace(/\\/g, '/');
                logger.info(`Company logo updated: ${updateData.companyLogo}`);
            }
        }
        
        const testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!testimonial) {
            logger.warn(`Testimonial not found for update: ${req.params.id}`);
            return res.status(404).json({ message: 'Testimonial not found' });
        }
        
        logger.info(`Testimonial updated successfully: ${testimonial.clientName}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(testimonial);
        }
        
        return res.redirect('/admin/testimonials?updated=true');
    } catch (error) {
        logger.error('Error updating testimonial:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error updating testimonial', error: error.message });
        }
        
        return res.redirect('/admin/testimonials?error=Failed to update testimonial');
    }
};

// Delete testimonial
exports.deleteTestimonial = async (req, res) => {
    try {
        logger.info(`Deleting testimonial: ${req.params.id}`);
        
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
        
        if (!testimonial) {
            logger.warn(`Testimonial not found for deletion: ${req.params.id}`);
            return res.status(404).json({ message: 'Testimonial not found' });
        }
        
        logger.info(`Testimonial deleted successfully: ${testimonial.clientName}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ message: 'Testimonial deleted successfully' });
        }
        
        return res.redirect('/admin/testimonials?deleted=true');
    } catch (error) {
        logger.error('Error deleting testimonial:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error deleting testimonial', error: error.message });
        }
        
        return res.redirect('/admin/testimonials?error=Failed to delete testimonial');
    }
};