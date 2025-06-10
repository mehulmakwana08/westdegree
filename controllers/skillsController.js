const Skill = require('../models/Skill');
const logger = require('../utils/logger');

// Get all skills for admin view
exports.getAdminSkills = async (req, res) => {
    try {
        logger.info('Loading admin skills page');
        const skills = await Skill.find().sort({ order: 1, createdAt: 1 });
        
        const successMessage = req.query.success;
        const errorMessage = req.query.error;
        
        logger.info(`Loaded ${skills.length} skills for admin view`);
        res.render('admin/skills', {
            title: 'Skills Management - Admin',
            skills: skills || [],
            success: successMessage === 'true',
            updated: req.query.updated === 'true',
            deleted: req.query.deleted === 'true',
            errorMessage: errorMessage
        });
    } catch (error) {
        logger.error('Error loading skills page:', error);
        res.status(500).render('error', {
            message: 'Error loading skills',
            error: error
        });
    }
};

// Get all skills (API endpoint)
exports.getAllSkills = async (req, res) => {
    try {
        logger.info('Fetching all skills');
        const skills = await Skill.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        logger.info(`Fetched ${skills.length} active skills`);
        res.json(skills);
    } catch (error) {
        logger.error('Error fetching skills:', error);
        res.status(500).json({ message: 'Error fetching skills', error: error.message });
    }
};

// Get single skill
exports.getSkill = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) {
            logger.warn(`Skill not found: ${req.params.id}`);
            return res.status(404).json({ message: 'Skill not found' });
        }
        logger.info(`Skill fetched: ${skill.name}`);
        res.json(skill);
    } catch (error) {
        logger.error('Error fetching skill:', error);
        res.status(500).json({ message: 'Error fetching skill', error: error.message });
    }
};

// Get single skill for editing
exports.getSkillForEdit = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) {
            logger.warn(`Skill not found for edit: ${req.params.id}`);
            return res.status(404).json({ message: 'Skill not found' });
        }
        logger.info(`Skill fetched for edit: ${skill.name}`);
        res.json(skill);
    } catch (error) {
        logger.error('Error fetching skill for edit:', error);
        res.status(500).json({ message: 'Error fetching skill', error: error.message });
    }
};

// Create new skill
exports.createSkill = async (req, res) => {
    try {
        logger.info('Creating new skill');
        const { name, percentage, icon, order, isActive } = req.body;
        
        if (!name || !percentage) {
            return res.status(400).json({ 
                message: 'Name and percentage are required' 
            });
        }

        if (percentage < 0 || percentage > 100) {
            return res.status(400).json({ 
                message: 'Percentage must be between 0 and 100' 
            });
        }
        
        // Handle file upload if present
        let iconPath = icon ? icon.trim() : '';
        if (req.file) {
            iconPath = '/' + req.file.path.replace(/\\/g, '/');
            logger.info(`Skill icon uploaded: ${iconPath}`);
        }
        
        const skill = new Skill({
            name: name.trim(),
            percentage: parseInt(percentage),
            icon: iconPath,
            order: order || 1,
            isActive: isActive === 'on' ? true : (isActive !== undefined ? isActive : true)
        });
        
        await skill.save();
        logger.info(`Skill created successfully: ${skill.name} (${skill.percentage}%)`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(201).json(skill);
        }
        
        return res.redirect('/admin/skills?success=true');
    } catch (error) {
        logger.error('Error creating skill:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error creating skill', error: error.message });
        }
        
        return res.redirect('/admin/skills?error=Failed to create skill');
    }
};

// Update skill
exports.updateSkill = async (req, res) => {
    try {
        logger.info(`Updating skill: ${req.params.id}`);
        const { name, percentage, icon, order, isActive } = req.body;
        
        if (!name || !percentage) {
            return res.status(400).json({ 
                message: 'Name and percentage are required' 
            });
        }

        if (percentage < 0 || percentage > 100) {
            return res.status(400).json({ 
                message: 'Percentage must be between 0 and 100' 
            });
        }
        
        const updateData = {
            name: name.trim(),
            percentage: parseInt(percentage),
            order: order || 1,
            isActive: isActive === 'on' ? true : (isActive !== undefined ? isActive : true)
        };

        // Handle file upload if present
        if (req.file) {
            updateData.icon = '/' + req.file.path.replace(/\\/g, '/');
            logger.info(`Skill icon uploaded: ${updateData.icon}`);
        } else if (icon) {
            updateData.icon = icon.trim();
        }
        
        const skill = await Skill.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!skill) {
            logger.warn(`Skill not found for update: ${req.params.id}`);
            return res.status(404).json({ message: 'Skill not found' });
        }
        
        logger.info(`Skill updated successfully: ${skill.name}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(skill);
        }
        
        return res.redirect('/admin/skills?updated=true');
    } catch (error) {
        logger.error('Error updating skill:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error updating skill', error: error.message });
        }
        
        return res.redirect('/admin/skills?error=Failed to update skill');
    }
};

// Delete skill
exports.deleteSkill = async (req, res) => {
    try {
        logger.info(`Deleting skill: ${req.params.id}`);
        
        const skill = await Skill.findByIdAndDelete(req.params.id);
        
        if (!skill) {
            logger.warn(`Skill not found for deletion: ${req.params.id}`);
            return res.status(404).json({ message: 'Skill not found' });
        }
        
        logger.info(`Skill deleted successfully: ${skill.name}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ message: 'Skill deleted successfully' });
        }
        
        return res.redirect('/admin/skills?deleted=true');
    } catch (error) {
        logger.error('Error deleting skill:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Error deleting skill', error: error.message });
        }
        
        return res.redirect('/admin/skills?error=Failed to delete skill');
    }
};