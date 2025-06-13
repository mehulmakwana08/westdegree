const Portfolio = require('../models/Portfolio');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Get all portfolios for API
exports.getPortfolios = async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.json({
            success: true,
            portfolios: portfolios
        });
    } catch (error) {
        logger.error('Error fetching portfolios:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching portfolios'
        });
    }
};

// Get single portfolio
exports.getPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id);
        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }

        // Find next portfolio (by order, then _id)
        let nextPortfolio = await Portfolio.findOne({
            isActive: true,
            $or: [
                { order: { $gt: portfolio.order } },
                { order: portfolio.order, _id: { $gt: portfolio._id } }
            ]
        }).sort({ order: 1, _id: 1 });
        if (!nextPortfolio) {
            // If not found, wrap to first
            nextPortfolio = await Portfolio.findOne({ isActive: true }).sort({ order: 1, _id: 1 });
        }

        // Find previous portfolio (by order, then _id)
        let prevPortfolio = await Portfolio.findOne({
            isActive: true,
            $or: [
                { order: { $lt: portfolio.order } },
                { order: portfolio.order, _id: { $lt: portfolio._id } }
            ]
        }).sort({ order: -1, _id: -1 });
        if (!prevPortfolio) {
            // If not found, wrap to last
            prevPortfolio = await Portfolio.findOne({ isActive: true }).sort({ order: -1, _id: -1 });
        }

        res.json({
            success: true,
            portfolio: portfolio,
            nextPortfolio: nextPortfolio && nextPortfolio._id.toString() !== portfolio._id.toString() ? nextPortfolio : null,
            prevPortfolio: prevPortfolio && prevPortfolio._id.toString() !== portfolio._id.toString() ? prevPortfolio : null
        });
    } catch (error) {
        logger.error('Error fetching portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching portfolio'
        });
    }
};

// Admin - Get portfolio management page
exports.getAdminPortfolios = async (req, res) => {
    try {
        const portfolios = await Portfolio.find().sort({ order: 1, createdAt: -1 });
        res.render('admin/portfolio', {
            title: 'Portfolio Management',
            portfolios: portfolios,
            successMessage: req.query.success,
            errorMessage: req.query.error
        });
    } catch (error) {
        logger.error('Error loading admin portfolios page:', error);
        res.redirect('/admin/portfolio?error=Error loading portfolios');
    }
};

// Create new portfolio
exports.createPortfolio = async (req, res) => {    try {
        const { title, shortDescription, longDescription, category, order } = req.body;
        
        // Handle file uploads
        let mainImage = '';
        let galleryImages = [];
        
        if (req.files) {
            if (req.files.image && req.files.image.length > 0) {
                mainImage = `/uploads/portfolio/${req.files.image[0].filename}`;
            }
            
            if (req.files.galleryImages) {
                req.files.galleryImages.forEach(file => {
                    galleryImages.push(`/uploads/portfolio/gallery/${file.filename}`);
                });
            }
        }        const portfolio = new Portfolio({
            title,
            image: mainImage,
            galleryImages,
            shortDescription,
            longDescription,
            category,
            order: order || 1
        });

        await portfolio.save();
        logger.info(`Portfolio created: ${title}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.json({
                success: true,
                message: 'Portfolio created successfully',
                portfolio: portfolio
            });
        } else {
            res.redirect('/admin/portfolio?success=created');
        }
    } catch (error) {
        logger.error('Error creating portfolio:', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.status(500).json({
                success: false,
                message: 'Error creating portfolio'
            });
        } else {
            res.redirect('/admin/portfolio?error=Error creating portfolio');
        }
    }
};

// Update portfolio
exports.updatePortfolio = async (req, res) => {    try {
        const { title, shortDescription, longDescription, category, order, isActive, removedGalleryImages } = req.body;
        
        const portfolio = await Portfolio.findById(req.params.id);
        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }        // Handle file uploads
        if (req.files) {
            if (req.files.image && req.files.image.length > 0) {
                // Delete old image if exists
                if (portfolio.image) {
                    const oldImagePath = path.join(__dirname, '..', portfolio.image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                portfolio.image = `/uploads/portfolio/${req.files.image[0].filename}`;
            }
            
            if (req.files.galleryImages) {
                req.files.galleryImages.forEach(file => {
                    portfolio.galleryImages.push(`/uploads/portfolio/gallery/${file.filename}`);
                });
            }
        }

        // Handle removed gallery images
        if (removedGalleryImages) {
            try {
                const removedImages = JSON.parse(removedGalleryImages);
                if (Array.isArray(removedImages)) {
                    removedImages.forEach(imagePath => {
                        // Remove from portfolio array
                        const imageIndex = portfolio.galleryImages.indexOf(imagePath);
                        if (imageIndex > -1) {
                            portfolio.galleryImages.splice(imageIndex, 1);
                        }
                        
                        // Delete file from filesystem
                        const fullImagePath = path.join(__dirname, '..', imagePath);
                        if (fs.existsSync(fullImagePath)) {
                            fs.unlinkSync(fullImagePath);
                            logger.info(`Deleted gallery image: ${imagePath}`);
                        }
                    });
                }
            } catch (error) {
                logger.warn('Error parsing removed gallery images:', error);
            }
        }// Update fields
        portfolio.title = title || portfolio.title;
        portfolio.shortDescription = shortDescription || portfolio.shortDescription;
        portfolio.longDescription = longDescription || portfolio.longDescription;
        portfolio.category = category || portfolio.category;
        portfolio.order = order || portfolio.order;
        portfolio.isActive = isActive === 'on' || isActive === true;

        await portfolio.save();
        logger.info(`Portfolio updated: ${portfolio.title}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.json({
                success: true,
                message: 'Portfolio updated successfully',
                portfolio: portfolio
            });
        } else {
            res.redirect('/admin/portfolio?success=updated');
        }
    } catch (error) {
        logger.error('Error updating portfolio:', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.status(500).json({
                success: false,
                message: 'Error updating portfolio'
            });
        } else {
            res.redirect('/admin/portfolio?error=Error updating portfolio');
        }
    }
};

// Delete portfolio
exports.deletePortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id);
        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }

        // Delete associated files
        if (portfolio.image) {
            const imagePath = path.join(__dirname, '..', portfolio.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        portfolio.galleryImages.forEach(galleryImage => {
            const galleryImagePath = path.join(__dirname, '..', galleryImage);
            if (fs.existsSync(galleryImagePath)) {
                fs.unlinkSync(galleryImagePath);
            }
        });

        await Portfolio.findByIdAndDelete(req.params.id);
        logger.info(`Portfolio deleted: ${portfolio.title}`);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.json({
                success: true,
                message: 'Portfolio deleted successfully'
            });
        } else {
            res.redirect('/admin/portfolio?success=deleted');
        }
    } catch (error) {
        logger.error('Error deleting portfolio:', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.status(500).json({
                success: false,
                message: 'Error deleting portfolio'
            });
        } else {
            res.redirect('/admin/portfolio?error=Error deleting portfolio');
        }
    }
};