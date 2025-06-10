const Education = require('../models/Education');
const logger = require('../utils/logger');

// Get all education for admin view
exports.getAdminEducation = async (req, res) => {
    try {
        logger.info('Loading admin education page');
        const education = await Education.find().sort({ order: 1, endYear: -1 });
        
        const successMessage = req.query.success;
        const errorMessage = req.query.error;
        
        logger.info(`Loaded ${education.length} education records for admin view`);
        res.render('admin/education', {
            title: 'Education Management - Admin',
            education: education || [],
            success: successMessage === 'true',
            updated: req.query.updated === 'true',
            deleted: req.query.deleted === 'true',
            errorMessage: errorMessage
        });
    } catch (error) {
        logger.error('Error loading education page:', error);
        res.status(500).render('error', {
            message: 'Error loading education',
            error: error
        });
    }
};

// Get all education (API endpoint)
exports.getAllEducation = async (req, res) => {
    try {
        logger.info('Fetching all education');
        const education = await Education.find({ isActive: true }).sort({ order: 1, endYear: -1 });
        logger.info(`Fetched ${education.length} active education records`);
        res.json(education);
    } catch (error) {
        logger.error('Error fetching education:', error);
        res.status(500).json({ message: 'Error fetching education', error: error.message });
    }
};

// Get single education
exports.getEducation = async (req, res) => {
    try {
        const education = await Education.findById(req.params.id);
        if (!education) {
            logger.warn(`Education not found: ${req.params.id}`);
            return res.status(404).json({ message: 'Education not found' });
        }
        logger.info(`Education fetched: ${education.degree}`);
        res.json(education);
    } catch (error) {
        logger.error('Error fetching education:', error);
        res.status(500).json({ message: 'Error fetching education', error: error.message });
    }
};

// Get single education for editing
exports.getEducationForEdit = async (req, res) => {
    try {
        const education = await Education.findById(req.params.id);
        if (!education) {
            logger.warn(`Education not found for edit: ${req.params.id}`);
            return res.status(404).json({ message: 'Education not found' });
        }
        logger.info(`Education fetched for edit: ${education.degree}`);
        res.json(education);
    } catch (error) {
        logger.error('Error fetching education for edit:', error);
        res.status(500).json({ message: 'Error fetching education', error: error.message });
    }
};

// Create new education
exports.createEducation = async (req, res) => {
    try {
        logger.info('Creating new education');
        const { degree, institution, location, startYear, endYear, grade, description, order, isActive } = req.body;
        
        if (!degree || !institution || !location || !startYear || !endYear) {
            return res.status(400).json({ 
                message: 'Degree, institution, location, start year, and end year are required' 
            });
        }
        
        const education = new Education({
            degree: degree.trim(),
            institution: institution.trim(),
            location: location.trim(),
            startYear: startYear.trim(),
            endYear: endYear.trim(),
            grade: grade ? grade.trim() : '',
            description: description ? description.trim() : '',
            order: order || 1,
            isActive: isActive === 'on' ? true : (isActive !== undefined ? isActive : true)
        });
        
        await education.save();
        logger.info(`Education created successfully: ${education.degree} at ${education.institution}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(201).json(education);
        }
        
        return res.redirect('/admin/education?success=true');
    } catch (error) {
        logger.error('Error creating education:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error creating education', error: error.message });
        }
        
        return res.redirect('/admin/education?error=Failed to create education');
    }
};

// Update education
exports.updateEducation = async (req, res) => {
    try {
        logger.info(`Updating education: ${req.params.id}`);
        const { degree, institution, location, startYear, endYear, grade, description, order, isActive } = req.body;
        
        if (!degree || !institution || !location || !startYear || !endYear) {
            return res.status(400).json({ 
                message: 'Degree, institution, location, start year, and end year are required' 
            });
        }
        
        const updateData = {
            degree: degree.trim(),
            institution: institution.trim(),
            location: location.trim(),
            startYear: startYear.trim(),
            endYear: endYear.trim(),
            grade: grade ? grade.trim() : '',
            description: description ? description.trim() : '',
            order: order || 1,
            isActive: isActive === 'on' ? true : (isActive !== undefined ? isActive : true)
        };
        
        const education = await Education.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!education) {
            logger.warn(`Education not found for update: ${req.params.id}`);
            return res.status(404).json({ message: 'Education not found' });
        }
        
        logger.info(`Education updated successfully: ${education.degree}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(education);
        }
        
        return res.redirect('/admin/education?updated=true');
    } catch (error) {
        logger.error('Error updating education:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error updating education', error: error.message });
        }
        
        return res.redirect('/admin/education?error=Failed to update education');
    }
};

// Delete education
exports.deleteEducation = async (req, res) => {
    try {
        logger.info(`Deleting education: ${req.params.id}`);
        
        const education = await Education.findByIdAndDelete(req.params.id);
        
        if (!education) {
            logger.warn(`Education not found for deletion: ${req.params.id}`);
            return res.status(404).json({ message: 'Education not found' });
        }
        
        logger.info(`Education deleted successfully: ${education.degree}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ message: 'Education deleted successfully' });
        }
        
        return res.redirect('/admin/education?deleted=true');
    } catch (error) {
        logger.error('Error deleting education:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error deleting education', error: error.message });
        }
        
        return res.redirect('/admin/education?error=Failed to delete education');
    }
};