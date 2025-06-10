const Skill = require('../models/Skill');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/assets/img/icons/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

class SkillController {
    // Display all skills in admin panel
    async index(req, res) {
        try {
            const skills = await Skill.find().sort({ order: 1, createdAt: -1 });
            res.render('admin/skills/index', { 
                skills,
                title: 'Manage Skills',
                success: req.flash('success'),
                error: req.flash('error')
            });
        } catch (error) {
            req.flash('error', 'Error fetching skills');
            res.redirect('/admin');
        }
    }

    // Show create skill form
    async create(req, res) {
        res.render('admin/skills/create', { 
            title: 'Add New Skill',
            error: req.flash('error')
        });
    }

    // Store new skill
    async store(req, res) {
        try {
            const { name, percentage, order } = req.body;
            const skillData = {
                name,
                percentage: parseInt(percentage),
                order: parseInt(order) || 0
            };

            if (req.file) {
                skillData.icon = req.file.filename;
            }

            await Skill.create(skillData);
            req.flash('success', 'Skill added successfully');
            res.redirect('/admin/skills');
        } catch (error) {
            req.flash('error', 'Error adding skill: ' + error.message);
            res.redirect('/admin/skills/create');
        }
    }

    // Show edit skill form
    async edit(req, res) {
        try {
            const skill = await Skill.findById(req.params.id);
            if (!skill) {
                req.flash('error', 'Skill not found');
                return res.redirect('/admin/skills');
            }
            res.render('admin/skills/edit', { 
                skill,
                title: 'Edit Skill',
                error: req.flash('error')
            });
        } catch (error) {
            req.flash('error', 'Error fetching skill');
            res.redirect('/admin/skills');
        }
    }

    // Update skill
    async update(req, res) {
        try {
            const { name, percentage, order, isActive } = req.body;
            const updateData = {
                name,
                percentage: parseInt(percentage),
                order: parseInt(order) || 0,
                isActive: isActive === 'on'
            };

            if (req.file) {
                updateData.icon = req.file.filename;
            }

            await Skill.findByIdAndUpdate(req.params.id, updateData);
            req.flash('success', 'Skill updated successfully');
            res.redirect('/admin/skills');
        } catch (error) {
            req.flash('error', 'Error updating skill: ' + error.message);
            res.redirect(`/admin/skills/${req.params.id}/edit`);
        }
    }

    // Delete skill
    async destroy(req, res) {
        try {
            await Skill.findByIdAndDelete(req.params.id);
            req.flash('success', 'Skill deleted successfully');
            res.redirect('/admin/skills');
        } catch (error) {
            req.flash('error', 'Error deleting skill');
            res.redirect('/admin/skills');
        }
    }

    // API endpoint to get skills for frontend
    async getSkills(req, res) {
        try {
            const skills = await Skill.find({ isActive: true }).sort({ order: 1 });
            res.json(skills);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching skills' });
        }
    }

    // Toggle skill status
    async toggleStatus(req, res) {
        try {
            const skill = await Skill.findById(req.params.id);
            if (!skill) {
                return res.status(404).json({ error: 'Skill not found' });
            }
            
            skill.isActive = !skill.isActive;
            await skill.save();
            
            res.json({ success: true, isActive: skill.isActive });
        } catch (error) {
            res.status(500).json({ error: 'Error updating skill status' });
        }
    }
}

module.exports = { SkillController: new SkillController(), upload };