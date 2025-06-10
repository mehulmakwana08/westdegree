const Experience = require('../models/Experience');
const logger = require('../utils/logger');

// Get all experiences for admin view
exports.getAdminExperiences = async (req, res) => {
    try {
        logger.info('Loading admin experiences page');
        const experiences = await Experience.find().sort({ order: 1, startDate: -1 });
        
        const successMessage = req.query.success;
        const errorMessage = req.query.error;
        
        logger.info(`Loaded ${experiences.length} experiences for admin view`);
        res.render('admin/experience', {
            title: 'Experience Management - Admin',
            experiences: experiences || [],
            success: successMessage === 'true',
            updated: req.query.updated === 'true',
            deleted: req.query.deleted === 'true',
            errorMessage: errorMessage
        });
    } catch (error) {
        logger.error('Error loading experiences page:', error);
        res.status(500).render('error', {
            message: 'Error loading experiences',
            error: error
        });
    }
};

// Get all experiences (API endpoint)
exports.getAllExperiences = async (req, res) => {
    try {
        logger.info('Fetching all experiences');
        const experiences = await Experience.find({ isActive: true }).sort({ order: 1, startDate: -1 });
        logger.info(`Fetched ${experiences.length} active experiences`);
        res.json(experiences);
    } catch (error) {
        logger.error('Error fetching experiences:', error);
        res.status(500).json({ message: 'Error fetching experiences', error: error.message });
    }
};

// Get single experience
exports.getExperience = async (req, res) => {
    try {
        const experience = await Experience.findById(req.params.id);
        if (!experience) {
            logger.warn(`Experience not found: ${req.params.id}`);
            return res.status(404).json({ message: 'Experience not found' });
        }
        logger.info(`Experience fetched: ${experience.jobTitle}`);
        res.json(experience);
    } catch (error) {
        logger.error('Error fetching experience:', error);
        res.status(500).json({ message: 'Error fetching experience', error: error.message });
    }
};

// Get single experience for editing
exports.getExperienceForEdit = async (req, res) => {
    try {
        const experience = await Experience.findById(req.params.id);
        if (!experience) {
            logger.warn(`Experience not found for edit: ${req.params.id}`);
            return res.status(404).json({ message: 'Experience not found' });
        }
        logger.info(`Experience fetched for edit: ${experience.jobTitle}`);
        res.json(experience);
    } catch (error) {
        logger.error('Error fetching experience for edit:', error);
        res.status(500).json({ message: 'Error fetching experience', error: error.message });
    }
};

// Create new experience
exports.createExperience = async (req, res) => {
    try {
        logger.info('Creating new experience');
        const { jobTitle, company, location, startDate, endDate, description, order, isActive } = req.body;
        
        if (!jobTitle || !company || !location || !startDate) {
            return res.status(400).json({ 
                message: 'Job title, company, location, and start date are required' 
            });
        }
        
        const experience = new Experience({
            jobTitle: jobTitle.trim(),
            company: company.trim(),
            location: location.trim(),
            startDate: startDate.trim(),
            endDate: endDate ? endDate.trim() : 'Present',
            description: description ? description.trim() : '',
            order: order || 1,
            isActive: isActive === 'on' ? true : (isActive !== undefined ? isActive : true)
        });
        
        await experience.save();
        logger.info(`Experience created successfully: ${experience.jobTitle} at ${experience.company}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(201).json(experience);
        }
        
        return res.redirect('/admin/experience?success=true');
    } catch (error) {
        logger.error('Error creating experience:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error creating experience', error: error.message });
        }
        
        return res.redirect('/admin/experience?error=Failed to create experience');
    }
};

// Update experience
exports.updateExperience = async (req, res) => {
    try {
        logger.info(`Updating experience: ${req.params.id}`);
        const { jobTitle, company, location, startDate, endDate, description, order, isActive } = req.body;
        
        if (!jobTitle || !company || !location || !startDate) {
            return res.status(400).json({ 
                message: 'Job title, company, location, and start date are required' 
            });
        }
        
        const updateData = {
            jobTitle: jobTitle.trim(),
            company: company.trim(),
            location: location.trim(),
            startDate: startDate.trim(),
            endDate: endDate ? endDate.trim() : 'Present',
            description: description ? description.trim() : '',
            order: order || 1,
            isActive: isActive === 'on' ? true : (isActive !== undefined ? isActive : true)
        };
        
        const experience = await Experience.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!experience) {
            logger.warn(`Experience not found for update: ${req.params.id}`);
            return res.status(404).json({ message: 'Experience not found' });
        }
        
        logger.info(`Experience updated successfully: ${experience.jobTitle}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(experience);
        }
        
        return res.redirect('/admin/experience?updated=true');
    } catch (error) {
        logger.error('Error updating experience:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error updating experience', error: error.message });
        }
        
        return res.redirect('/admin/experience?error=Failed to update experience');
    }
};

// Delete experience
exports.deleteExperience = async (req, res) => {
    try {
        logger.info(`Deleting experience: ${req.params.id}`);
        
        const experience = await Experience.findByIdAndDelete(req.params.id);
        
        if (!experience) {
            logger.warn(`Experience not found for deletion: ${req.params.id}`);
            return res.status(404).json({ message: 'Experience not found' });
        }
        
        logger.info(`Experience deleted successfully: ${experience.jobTitle}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ message: 'Experience deleted successfully' });
        }
        
        return res.redirect('/admin/experience?deleted=true');
    } catch (error) {
        logger.error('Error deleting experience:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error deleting experience', error: error.message });
        }
        
        return res.redirect('/admin/experience?error=Failed to delete experience');
    }
};