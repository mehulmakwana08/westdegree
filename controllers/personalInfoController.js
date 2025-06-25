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
        if (req.files && req.files.length > 0) {
            logger.info(`Processing ${req.files.length} file uploads`);
            // Handle logo, profile image, and CV uploads
            req.files.forEach(file => {
                try {
                    // Using only local file storage
                    const fileName = file.filename || file.path.replace(/\\/g, '/').split('/').pop();
                    
                    // Determine the correct subdirectory based on fieldname
                    let subDir = '';
                    if (file.fieldname === 'logo') {
                        subDir = 'logos/';
                    } else if (file.fieldname === 'profileImage') {
                        subDir = 'profiles/';
                    } else if (file.fieldname === 'cvFile') {
                        subDir = 'cvs/';
                    }
                    
                    const filePath = `/uploads/${subDir}${fileName}`;
                    
                    if (file.fieldname === 'logo') {
                        updateData.logo = filePath;
                        logger.info(`Logo uploaded: ${updateData.logo}`);
                    } else if (file.fieldname === 'profileImage') {
                        updateData.profileImage = filePath;
                        logger.info(`Profile image uploaded: ${updateData.profileImage}`);
                    } else if (file.fieldname === 'cvFile') {
                        updateData.cvFile = filePath;
                        logger.info(`CV file uploaded: ${updateData.cvFile}`);
                    }
                } catch (fileError) {
                    logger.error(`Error processing file ${file.fieldname}:`, fileError);
                    throw new Error(`Failed to process uploaded file: ${file.fieldname}`);
                }
            });
        } else if (req.file) {
            // Handle single file upload
            try {
                const fileName = req.file.filename || req.file.path.replace(/\\/g, '/').split('/').pop();
                
                // Determine the correct subdirectory based on fieldname
                let subDir = '';
                if (req.file.fieldname === 'logo') {
                    subDir = 'logos/';
                } else if (req.file.fieldname === 'profileImage') {
                    subDir = 'profiles/';
                } else if (req.file.fieldname === 'cvFile') {
                    subDir = 'cvs/';
                }
                
                const filePath = `/uploads/${subDir}${fileName}`;
                
                if (req.file.fieldname === 'logo') {
                    updateData.logo = filePath;
                    logger.info(`Logo uploaded: ${updateData.logo}`);
                } else if (req.file.fieldname === 'profileImage') {
                    updateData.profileImage = filePath;
                    logger.info(`Profile image uploaded: ${updateData.profileImage}`);
                } else if (req.file.fieldname === 'cvFile') {
                    updateData.cvFile = filePath;
                    logger.info(`CV file uploaded: ${updateData.cvFile}`);
                }
            } catch (fileError) {
                logger.error(`Error processing single file ${req.file.fieldname}:`, fileError);
                throw new Error(`Failed to process uploaded file: ${req.file.fieldname}`);
            }
        }
        
        // Handle social links
        if (req.body.socialLinks) {
            const socialLinksData = typeof req.body.socialLinks === 'string' 
                ? JSON.parse(req.body.socialLinks) 
                : req.body.socialLinks;
                
            // Filter out empty social links and validate required fields
            updateData.socialLinks = socialLinksData
                .filter(link => link.name && link.url && link.name.trim() && link.url.trim()) // Only include links with both name and url
                .map((link, index) => {
                    let socialIconFile = null;
                    
                    // Check for social icon file upload
                    if (req.files && req.files.length > 0) {
                        socialIconFile = req.files.find(file => 
                            file.fieldname === `socialIcon_${index}`
                        );
                    }
                    
                    let iconPath = link.icon || '';
                    if (socialIconFile) {
                        try {
                            // Using only local file storage
                            const fileName = socialIconFile.filename || socialIconFile.path.replace(/\\/g, '/').split('/').pop();
                            iconPath = `/uploads/social-icons/${fileName}`;
                            logger.info(`Social icon uploaded for ${link.name}: ${iconPath}`);
                        } catch (fileError) {
                            logger.error(`Error processing social icon for ${link.name}:`, fileError);
                            // Keep existing icon path if file processing fails
                        }
                    }
                    
                    return {
                        name: link.name.trim(),
                        url: link.url.trim(),
                        icon: iconPath
                    };
                });
            
            logger.info(`Processed ${updateData.socialLinks.length} valid social links`);
        }

        if (personalInfo) {
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
        }    } catch (error) {
        logger.error('Error updating personal information:', error);
        
        // Check if it's an API request or web request
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ 
                message: 'Error updating personal information', 
                error: error.message 
            });
        }
        
        // For web requests, redirect with error message
        return res.redirect('/admin/personal-info?error=' + encodeURIComponent(error.message));
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