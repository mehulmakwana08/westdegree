const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const nodemailer = require('nodemailer');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Gerold - Personal Portfolio',
        pageTitle: 'Home',
        siteName: process.env.SITE_NAME || 'Gerold Portfolio'
    });
});

app.get('/light', (req, res) => {
    res.render('index-light', {
        title: 'Gerold - Personal Portfolio (Light Mode)',
        pageTitle: 'Home - Light Mode',
        siteName: process.env.SITE_NAME || 'Gerold Portfolio'
    });
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

// Admin routes
app.get('/admin', (req, res) => {
    res.redirect('/admin/login');
});

app.get('/admin/login', (req, res) => {
    res.render('admin/login', {
        title: 'Admin Login - Gerold Portfolio',
        pageTitle: 'Admin Login',
        siteName: process.env.SITE_NAME || 'Gerold Portfolio'
    });
});

app.get('/admin/dashboard', (req, res) => {
    // Simple authentication check (you should implement proper authentication)
    if (req.session.isAuthenticated) {
        res.render('admin/dashboard', {
            title: 'Dashboard - Gerold Portfolio',
            pageTitle: 'Dashboard',
            siteName: process.env.SITE_NAME || 'Gerold Portfolio'
        });
    } else {
        res.redirect('/admin/login');
    }
});

app.get('/admin/personal-info', (req, res) => {
    if (req.session.isAuthenticated) {
        res.render('admin/personal-info', {
            title: 'Personal Info - Gerold Portfolio',
            pageTitle: 'Personal Info',
            siteName: process.env.SITE_NAME || 'Gerold Portfolio'
        });
    } else {
        res.redirect('/admin/login');
    }
});

app.get('/admin/portfolio', (req, res) => {
    if (req.session.isAuthenticated) {
        res.render('admin/portfolio', {
            title: 'Portfolio Management - Gerold Portfolio',
            pageTitle: 'Portfolio Management',
            siteName: process.env.SITE_NAME || 'Gerold Portfolio'
        });
    } else {
        res.redirect('/admin/login');
    }
});

app.get('/admin/services', (req, res) => {
    if (req.session.isAuthenticated) {
        res.render('admin/services', {
            title: 'Services Management - Gerold Portfolio',
            pageTitle: 'Services Management',
            siteName: process.env.SITE_NAME || 'Gerold Portfolio'
        });
    } else {
        res.redirect('/admin/login');
    }
});

// Contact form handler
app.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

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
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.json({ success: false, message: 'Failed to send message. Please try again.' });
    }
});

// Simple admin login handler (you should implement proper authentication)
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Simple authentication (replace with proper authentication)
    if (username === 'admin' && password === 'password') {
        req.session.isAuthenticated = true;
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin/login', {
            title: 'Admin Login - Gerold Portfolio',
            pageTitle: 'Admin Login',
            siteName: process.env.SITE_NAME || 'Gerold Portfolio',
            error: 'Invalid credentials'
        });
    }
});

// Admin logout
app.post('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// File upload handler
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.json({ success: true, filename: req.file.filename, path: `/uploads/${req.file.filename}` });
    } else {
        res.json({ success: false, message: 'No file uploaded' });
    }
});

// 404 handler
app.get('*', (req, res) => {
    res.status(404).render('404', {
        title: '404 - Page Not Found',
        pageTitle: '404 - Page Not Found',
        siteName: process.env.SITE_NAME || 'Gerold Portfolio'
    });
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
