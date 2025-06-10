// Add this to your main app.js or server.js file

const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));

// Session configuration for flash messages
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Routes
const skillRoutes = require('./routes/skills');
app.use('/admin/skills', skillRoutes);

// API route for frontend
app.get('/api/skills', async (req, res) => {
    try {
        const Skill = require('./models/Skill');
        const skills = await Skill.find({ isActive: true }).sort({ order: 1 });
        res.json(skills);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching skills' });
    }
});

// Make sure to connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your-database-name', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;