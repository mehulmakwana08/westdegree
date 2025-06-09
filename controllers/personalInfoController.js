const PersonalInfo = require('../models/PersonalInfo');
const logger = require('../utils/logger');

// Get personal info
exports.getPersonalInfo = async (req, res) => {
    try {
        logger.info('Fetching personal information');
        const personalInfo = await PersonalInfo.findOne();
        if (!personalInfo) {
            logger.warn('Personal information not found');
            return res.status(404).json({ message: 'Personal information not found' });
        }
        logger.info('Personal information fetched successfully');
        res.json(personalInfo);
    } catch (error) {
        logger.error('Error fetching personal information:', error);
        res.status(500).json({ message: 'Error fetching personal information', error: error.message });
    }
};

// Update personal info
exports.updatePersonalInfo = async (req, res) => {
    try {
        logger.info('Updating personal information');
        const personalInfo = await PersonalInfo.findOne();
        const updateData = { ...req.body };

        // Handle file uploads if present
        if (req.files) {
            logger.info(`Processing ${req.files.length} file uploads`);
            // Handle logo, profile image, and CV uploads
            req.files.forEach(file => {
                if (file.fieldname === 'logo') {
                    updateData.logo = '/' + file.path.replace(/\\/g, '/');
                    logger.info(`Logo uploaded: ${updateData.logo}`);
                } else if (file.fieldname === 'profileImage') {
                    updateData.profileImage = '/' + file.path.replace(/\\/g, '/');
                    logger.info(`Profile image uploaded: ${updateData.profileImage}`);
                } else if (file.fieldname === 'cvFile') {
                    updateData.cvFile = '/' + file.path.replace(/\\/g, '/');
                    logger.info(`CV file uploaded: ${updateData.cvFile}`);
                }
            });
        }        // Handle social links
        if (req.body.socialLinks) {
            const socialLinksData = typeof req.body.socialLinks === 'string' 
                ? JSON.parse(req.body.socialLinks) 
                : req.body.socialLinks;

            // Filter out empty social links and validate required fields
            updateData.socialLinks = socialLinksData
                .filter(link => link.name && link.url && link.name.trim() && link.url.trim()) // Only include links with both name and url
                .map((link, index) => {
                    const socialIconFile = req.files?.find(file => 
                        file.fieldname === `socialIcon_${index}`
                    );
                    
                    return {
                        name: link.name.trim(),
                        url: link.url.trim(),
                        icon: socialIconFile 
                            ? '/' + socialIconFile.path.replace(/\\/g, '/') 
                            : (link.icon || '') // Keep existing icon or empty string
                    };
                });
            
            logger.info(`Processed ${updateData.socialLinks.length} valid social links`);
        }        if (personalInfo) {
            // Update existing record
            logger.info(`Updating existing personal info with ID: ${personalInfo._id}`);
            const updatedInfo = await PersonalInfo.findByIdAndUpdate(
                personalInfo._id,
                updateData,
                { new: true }
            );
            logger.info('Personal information updated successfully');
            
            // For API requests, return JSON
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.json(updatedInfo);
            }
            
            // For web requests, redirect with success message
            return res.redirect('/admin/personal-info?success=updated');
        } else {
            // Create new record
            logger.info('Creating new personal information record');
            const newPersonalInfo = new PersonalInfo(updateData);
            await newPersonalInfo.save();
            logger.info('Personal information created successfully');
            
            // For API requests, return JSON
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(201).json(newPersonalInfo);
            }
            
            // For web requests, redirect with success message
            return res.redirect('/admin/personal-info?success=created');
        }
    } catch (error) {
        logger.error('Error updating personal information:', error);
        res.status(500).json({ message: 'Error updating personal information', error: error.message });
    }
};

// Get admin view of personal info
exports.getAdminPersonalInfo = async (req, res) => {
    try {
        logger.info('Loading admin personal info page');
        const personalInfo = await PersonalInfo.findOne();
        
        // Check for success or error messages in query parameters
        const successMessage = req.query.success;
        const errorMessage = req.query.error;
        
        logger.info('Admin personal info page loaded successfully');
        res.render('admin/personal-info', {
            title: 'Personal Info - Admin',
            personalInfo: personalInfo || {},
            successMessage: successMessage,
            errorMessage: errorMessage
        });
    } catch (error) {
        logger.error('Error loading personal information page:', error);
        res.status(500).render('error', {
            message: 'Error loading personal information',
            error: error
        });
    }
};