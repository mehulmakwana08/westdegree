const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const User = require('./models/User');
const authController = require('./controllers/authController');
const adminController = require('./controllers/adminController');
const bcrypt = require('bcryptjs');
const logger = require('./utils/logger');

// Conditionally require Cloudinary config
let upload;
try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const { genericUpload } = require('./config/cloudinary');
        upload = genericUpload;
        logger.info('Using Cloudinary for file uploads');
    } else {
        // Fallback to local storage for development
        const multer = require('multer');
        const fs = require('fs');
        
        // Ensure upload directory exists
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads', { recursive: true });
        }
        
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'uploads/');
            },
            filename: function (req, file, cb) {
                cb(null, Date.now() + '-' + file.originalname);
            }
        });
        upload = multer({ storage: storage });
        logger.info('Using local storage for file uploads (development mode)');
    }
} catch (error) {
    logger.warn('Cloudinary configuration error, falling back to local storage:', error.message);
    // Fallback configuration
    const multer = require('multer');
    const fs = require('fs');
    
    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads', { recursive: true });
    }
    
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });
    upload = multer({ storage: storage });
}

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_uri_here') {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        logger.info('Connected to MongoDB Atlas');
    })
    .catch(err => {
        logger.error('MongoDB connection error:', err.message);
        logger.warn('Application will continue without database functionality');
    });
} else {
    logger.warn('MongoDB URI not configured. Database functionality will be disabled.');
}

// Import routes
const personalInfoRoutes = require('./routes/personalInfoRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const educationRoutes = require('./routes/educationRoutes');
const skillsRoutes = require('./routes/skillsRoutes');
const testimonialsRoutes = require('./routes/testimonialsRoutes');
const contactsRoutes = require('./routes/contactsRoutes');

// Set up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// Add CORS headers for AJAX requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Request logging middleware (production-ready)
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
        
        logger.log(logLevel, 'HTTP Request', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
        });
        
        // Log errors separately
        if (res.statusCode >= 500) {
            logger.error('Server Error', {
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                duration: `${duration}ms`
            });
        }
    });
    
    next();
});

// Serve static files from /assets URL
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session configuration with MongoDB store
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'gerold-portfolio-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Set to true in production with HTTPS
        maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
    }
};

// Add MongoDB session store if available
if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_uri_here') {
    try {
        sessionConfig.store = MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            touchAfter: 24 * 3600, // lazy session update
            ttl: 14 * 24 * 60 * 60 // 14 days
        });
        logger.info('Using MongoDB session store');
    } catch (error) {
        logger.warn('Failed to create MongoDB session store, using memory store:', error.message);
    }
} else {
    logger.info('Using memory session store (development mode)');
}

app.use(session(sessionConfig));

// Configure multer for file uploads with Cloudinary
// Upload configuration is set above based on environment

// Import PersonalInfo model
const PersonalInfo = require('./models/PersonalInfo');
const Service = require('./models/Service');
const Portfolio = require('./models/Portfolio');
const Experience = require('./models/Experience');
const Education = require('./models/Education');
const Skill = require('./models/Skill');
const Testimonial = require('./models/Testimonial');
const Contact = require('./models/Contact');

// Routes
app.get('/', async (req, res) => {
    try {
        const personalInfo = await PersonalInfo.findOne();        const services = await Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        const portfolios = await Portfolio.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        const experiences = await Experience.find({ isActive: true }).sort({ order: 1, startDate: -1 });
        const education = await Education.find({ isActive: true }).sort({ order: 1, endYear: -1 });
        const skills = await Skill.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        const testimonials = await Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        logger.info('Loading homepage with personal info, services, portfolios, experiences, education, and testimonials');
        
        // Check for contact form feedback
        const contactStatus = req.query.contact;
        let contactMessage = null;
        let contactSuccess = false;
        
        if (contactStatus === 'success') {
            contactMessage = 'Thank you for your message! We will get back to you soon.';
            contactSuccess = true;
        } else if (contactStatus === 'error') {
            contactMessage = 'Sorry, there was an error sending your message. Please try again.';
            contactSuccess = false;
        }
        
          res.render('index', {
            title: personalInfo ? `${personalInfo.name} - Personal Portfolio` : 'Personal Portfolio',
            pageTitle: 'Home',
            siteName: personalInfo ? personalInfo.name : 'Personal Portfolio',
            personalInfo: personalInfo || {},
            services: services || [],            portfolios: portfolios || [],
            experiences: experiences || [],
            education: education || [],
            skills: skills || [],
            testimonials: testimonials || [],
            contactMessage: contactMessage,
            contactSuccess: contactSuccess
        });
    } catch (error) {
        logger.error('Error loading homepage:', error);
        res.render('index', {
            title: 'Personal Portfolio',
            pageTitle: 'Home',
            siteName: 'Personal Portfolio',            personalInfo: {},
            services: [],            portfolios: [],
            experiences: [],
            education: [],
            skills: [],
            testimonials: [],
            contactMessage: null,
            contactSuccess: false
        });
    }
});

app.get('/dynamic', async (req, res) => {
    try {
        const personalInfo = await PersonalInfo.findOne();
        const services = await Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        const portfolios = await Portfolio.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        logger.info('Loading dynamic homepage with personal info, services, and portfolios');
        
        res.render('index-dynamic', {
            title: personalInfo ? `${personalInfo.name} - Personal Portfolio` : 'Personal Portfolio',
            pageTitle: 'Home',
            siteName: personalInfo ? personalInfo.name : 'Personal Portfolio',
            personalInfo: personalInfo || {},
            services: services || [],
            portfolios: portfolios || []
        });
    } catch (error) {
        logger.error('Error loading dynamic homepage:', error);
        res.render('index-dynamic', {
            title: 'Personal Portfolio',
            pageTitle: 'Home',
            siteName: 'Personal Portfolio',
            personalInfo: {},
            services: [],
            portfolios: []
        });
    }
});

app.get('/blog', (req, res) => {
    res.render('blog', {
        title: 'Blog - Gerold Portfolio',
        pageTitle: 'Blog',
        siteName: process.env.SITE_NAME || 'Gerold Portfolio'
    });
});

app.get('/blog-light', (req, res) => {
    res.render('blog-light', {
        title: 'Blog - Gerold Portfolio (Light Mode)',
        pageTitle: 'Blog - Light Mode',
        siteName: process.env.SITE_NAME || 'Gerold Portfolio'
    });
});

app.get('/blog-details', (req, res) => {
    res.render('blog-details', {
        title: 'Blog Details - Gerold Portfolio',
        pageTitle: 'Blog Details',
        siteName: process.env.SITE_NAME || 'Gerold Portfolio'
    });
});

app.get('/blog-details-light', (req, res) => {
    res.render('blog-details-light', {
        title: 'Blog Details - Gerold Portfolio (Light Mode)',
        pageTitle: 'Blog Details - Light Mode',
        siteName: process.env.SITE_NAME || 'Gerold Portfolio'
    });
});

// Admin route middleware to check authentication
const { isAuthenticated, authenticateJWT, authenticateHybrid } = require('./middleware/auth');

// Admin routes
app.get('/admin', (req, res) => {
    res.redirect('/admin/login');
});

app.get('/admin/login', authController.getLogin);
app.post('/admin/login', authController.postLogin);
app.get('/admin/register', (req, res) => {
    res.render('admin/register', { title: 'Admin Registration - Testing' });
});
app.post('/admin/register', authController.postRegister); // Testing route
app.get('/admin/dashboard', isAuthenticated, adminController.getDashboard);
app.get('/admin/logout', authController.logout);

// API routes for JWT authentication
app.get('/api/dashboard', authenticateJWT, adminController.getDashboard);
app.post('/api/login', authController.postLogin);
app.post('/api/register', authController.postRegister);

// Apply authentication middleware to admin routes
app.use('/admin/personal-info', isAuthenticated);
app.use('/admin/services', isAuthenticated);
app.use('/admin/portfolio', isAuthenticated);
app.use('/admin/experience', isAuthenticated);
app.use('/admin/education', isAuthenticated);
app.use('/admin/skills', isAuthenticated);
app.use('/admin/testimonials', isAuthenticated);
app.use('/admin/blogs', isAuthenticated);
app.use('/admin/contacts', isAuthenticated);

// Contact form handler
app.post('/contact', async (req, res) => {
    try {
        logger.info('Contact form data received', { 
            body: req.body,
            headers: {
                'content-type': req.headers['content-type'],
                'x-requested-with': req.headers['x-requested-with'],
                'accept': req.headers.accept
            }
        });
        
        const { name, email, subject, message, conName, conLName, conEmail, conPhone, conService, conMessage } = req.body;
          // Handle both old and new form field names
        const firstName = conName || name || req.body.firstName || req.body.fullname || '';
        const lastName = conLName || req.body.lastName || '';
        const contactEmail = conEmail || email || req.body.userEmail || '';
        const contactMessage = conMessage || message || subject || req.body.userMessage || '';
        const phone = conPhone || req.body.phone || req.body.userPhone || '';
        const service = conService || req.body.service || req.body.userService || '';
        
        logger.debug('Processed form data', {
            firstName,
            lastName,
            contactEmail,
            contactMessage,
            phone,
            service
        });
        
        // Validation - check if we have the minimum required fields
        if (!firstName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
            logger.warn('Contact form validation failed: missing required fields', {
                firstName: !!firstName.trim(),
                contactEmail: !!contactEmail.trim(),
                contactMessage: !!contactMessage.trim(),
                receivedData: req.body
            });
            
            // Always return JSON for AJAX requests
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || 
                (req.headers.accept && req.headers.accept.includes('application/json'))) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, and message are required fields.'
                });
            }
            
            return res.redirect('/?contact=error');
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactEmail.trim())) {
            logger.warn('Contact form validation failed: invalid email format', {
                email: contactEmail
            });
            
            if (req.headers['x-requested-with'] === 'XMLHttpRequest' || 
                (req.headers.accept && req.headers.accept.includes('application/json'))) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter a valid email address.'
                });
            }
            
            return res.redirect('/?contact=error');
        }
        
        logger.info(`Contact form submission from ${contactEmail}`);

        // Save to database
        const contact = new Contact({
            firstName: firstName.trim(),
            lastName: lastName.trim() || '',
            email: contactEmail.trim().toLowerCase(),
            phone: phone.trim(),
            service: service.trim(),
            message: contactMessage.trim()
        });
        
        await contact.save();
        logger.info(`Contact saved to database: ${contact.firstName} ${contact.lastName} (${contact.email})`);
        
        // Check if it's an AJAX request
        if (req.headers['x-requested-with'] === 'XMLHttpRequest' || 
            (req.headers.accept && req.headers.accept.includes('application/json'))) {
            // AJAX request - return JSON
            return res.json({
                success: true,
                message: 'Thank you for your message! We will get back to you soon.'
            });
        } else {
            // Form submission - redirect with success parameter
            return res.redirect('/?contact=success');
        }
    } catch (error) {
        logger.error('Contact form error:', error);
        
        // Check if it's an AJAX request
        if (req.headers['x-requested-with'] === 'XMLHttpRequest' || 
            (req.headers.accept && req.headers.accept.includes('application/json'))) {
            // AJAX request - return JSON error
            return res.status(500).json({
                success: false,
                message: 'Failed to send message. Please try again.'
            });
        } else {
            // Form submission - redirect with error parameter
            return res.redirect('/?contact=error');
        }
    }
});

// File upload handler
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        logger.info(`File uploaded successfully: ${req.file.filename}`);
        // For Cloudinary, the file path is in req.file.path
        res.json({ 
            success: true, 
            filename: req.file.filename || req.file.original_filename,
            path: req.file.path || req.file.secure_url,
            url: req.file.secure_url || req.file.path
        });
    } else {
        logger.warn('File upload failed: No file provided');
        res.json({ success: false, message: 'No file uploaded' });
    }
});

// Use routes
app.use('/', personalInfoRoutes);
app.use('/', servicesRoutes);
app.use('/', portfolioRoutes);
app.use('/', experienceRoutes);
app.use('/', educationRoutes);
app.use('/', skillsRoutes);
app.use('/', testimonialsRoutes);
app.use('/', contactsRoutes);

// 404 handler
app.get('*', async (req, res) => {
    try {
        const personalInfo = await PersonalInfo.findOne();
        res.status(404).render('404', {
            title: '404 - Page Not Found',
            pageTitle: '404 - Page Not Found',
            siteName: process.env.SITE_NAME || 'Gerold Portfolio',
            personalInfo: personalInfo || {}
        });
    } catch (error) {
        logger.error('Error loading 404 page:', error);
        res.status(404).render('404', {
            title: '404 - Page Not Found',
            pageTitle: '404 - Page Not Found',
            siteName: process.env.SITE_NAME || 'Gerold Portfolio',
            personalInfo: {}
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    logger.error('Application error', { error: err.stack, message: err.message });
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info(`Views directory: ${path.join(__dirname, 'views')}`);
    logger.info(`Static files directory: ${path.join(__dirname, 'assets')}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
