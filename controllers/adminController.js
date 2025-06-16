const logger = require('../utils/logger');

exports.getDashboard = async (req, res) => {
    try {
        // Get user data from either session or JWT
        const user = req.session?.user || req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        logger.info(`Dashboard accessed by user: ${user.username}`);        // Get dashboard statistics
        const PersonalInfo = require('../models/PersonalInfo');
        const Service = require('../models/Service');
        const Portfolio = require('../models/Portfolio');
        const Experience = require('../models/Experience');
        const Education = require('../models/Education');
        const Skill = require('../models/Skill');
        const Contact = require('../models/Contact');
        
        const stats = {
            totalContacts: await Contact.countDocuments() || 0, 
            unreadContacts: await Contact.countDocuments({ isRead: false }) || 0,
            totalProjects: await Portfolio.countDocuments({ isActive: true }) || 0,
            totalBlogs: 0,
            totalServices: await Service.countDocuments({ isActive: true }) || 0,
            totalSkills: await Skill.countDocuments({ isActive: true }) || 0,
            totalExperience: await Experience.countDocuments({ isActive: true }) || 0,
            totalEducation: await Education.countDocuments({ isActive: true }) || 0
        };

        const recentContacts = await Contact.find().sort({ createdAt: -1 }).limit(5);

        logger.debug('Dashboard statistics loaded', { stats });

        // For API requests, return JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({
                success: true,
                admin: user,
                stats: stats,
                recentContacts: recentContacts
            });
        }

        // For web requests, render the dashboard
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            admin: user,
            stats: stats,
            recentContacts: recentContacts,
            currentPage: 'dashboard'  // Add currentPage variable
        });
    } catch (error) {
        logger.error('Error loading dashboard:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({
                success: false,
                message: 'Error loading dashboard'
            });
        }
        
        res.status(500).render('error', { 
            message: 'Error loading dashboard',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};