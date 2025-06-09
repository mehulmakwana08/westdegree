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

        logger.info(`Dashboard accessed by user: ${user.username}`);
        
        // Get dashboard statistics
        const stats = {
            totalContacts: 0, 
            unreadContacts: 0,
            totalProjects: 0,
            totalBlogs: 0
        };

        const recentContacts = []; // You can implement fetching recent contacts

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
            recentContacts: recentContacts
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