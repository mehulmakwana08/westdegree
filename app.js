const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const User = require('./models/User');
const authController = require('./controllers/authController');
const adminController = require('./controllers/adminController');
const bcrypt = require('bcryptjs');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directories exist
const fs = require('fs');
const uploadDirs = [
    'uploads',
    'uploads/logos',
    'uploads/profiles', 
    'uploads/cvs',
    'uploads/social-icons',
    'uploads/portfolio',
    'uploads/portfolio/gallery'
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    logger.info('Connected to MongoDB Atlas');
    console.log('Connected to MongoDB Atlas');
})
.catch(err => {
    logger.error('MongoDB connection error:', err);
    console.error('MongoDB connection error:', err);
});

// Import routes
const personalInfoRoutes = require('./routes/personalInfoRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const educationRoutes = require('./routes/educationRoutes');

// Set up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Serve static files from /assets URL
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'gerold-portfolio-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Import PersonalInfo model
const PersonalInfo = require('./models/PersonalInfo');
const Service = require('./models/Service');
const Portfolio = require('./models/Portfolio');
const Experience = require('./models/Experience');
const Education = require('./models/Education');

// Routes
app.get('/', async (req, res) => {
    try {
        const personalInfo = await PersonalInfo.findOne();
        const services = await Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        const portfolios = await Portfolio.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        const experiences = await Experience.find({ isActive: true }).sort({ order: 1, startDate: -1 });
        const education = await Education.find({ isActive: true }).sort({ order: 1, endYear: -1 });
        logger.info('Loading homepage with personal info, services, portfolios, experiences, and education');
        
        res.render('index', {
            title: personalInfo ? `${personalInfo.name} - Personal Portfolio` : 'Personal Portfolio',
            pageTitle: 'Home',
            siteName: personalInfo ? personalInfo.name : 'Personal Portfolio',
            personalInfo: personalInfo || {},
            services: services || [],
            portfolios: portfolios || [],
            experiences: experiences || [],
            education: education || []
        });
    } catch (error) {
        logger.error('Error loading homepage:', error);
        res.render('index', {
            title: 'Personal Portfolio',
            pageTitle: 'Home',
            siteName: 'Personal Portfolio',
            personalInfo: {},
            services: [],
            portfolios: [],
            experiences: [],
            education: []
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
        const { name, email, subject, message } = req.body;
        logger.info(`Contact form submission from ${email}`);

        // Create nodemailer transporter
        const transporter = nodemailer.createTransporter({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
            subject: `Contact Form: ${subject}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        logger.info(`Contact form email sent successfully for ${email}`);
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        logger.error('Contact form error:', error);
        console.error('Contact form error:', error);
        res.json({ success: false, message: 'Failed to send message. Please try again.' });
    }
});

// File upload handler
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        logger.info(`File uploaded successfully: ${req.file.filename}`);
        res.json({ success: true, filename: req.file.filename, path: `/uploads/${req.file.filename}` });
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
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📁 Views directory: ${path.join(__dirname, 'views')}`);
    console.log(`📁 Static files directory: ${path.join(__dirname, 'assets')}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
