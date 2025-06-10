# Dynamic Portfolio - Node.js Project

A comprehensive portfolio website built with Node.js, Express, MongoDB, and EJS templating. Features include admin panel, dynamic content management, file uploads, and contact forms.

## 🚀 Features

- **Dynamic Content Management**: Admin panel to manage portfolio content
- **File Uploads**: Image and document uploads with Cloudinary integration
- **Contact Forms**: Email functionality with Nodemailer
- **Responsive Design**: Mobile-friendly portfolio layout
- **Authentication**: Secure admin login system
- **Database Integration**: MongoDB with Mongoose ODM
- **Session Management**: Secure session storage with MongoDB
- **Logging**: Comprehensive logging with Winston

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Template Engine**: EJS
- **File Storage**: Cloudinary
- **Authentication**: JWT, bcrypt
- **Session Store**: connect-mongo
- **Email**: Nodemailer
- **Logging**: Winston

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account (for file uploads)
- Gmail account (for email functionality)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd westdegree
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Session Configuration
SESSION_SECRET=your-super-secure-session-secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CONTACT_EMAIL=your-contact-email@gmail.com

# Site Configuration
SITE_NAME=Your Portfolio Name
SITE_URL=http://localhost:3000
```

### 4. Run the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🌐 Vercel Deployment

This project is optimized for Vercel deployment with serverless functions.

### Quick Deploy to Vercel

1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (see list below)
   - Deploy

### Required Environment Variables for Vercel

```
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
SESSION_SECRET=your-secure-session-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CONTACT_EMAIL=your-contact@email.com
SITE_NAME=Your Portfolio Name
SITE_URL=https://your-domain.vercel.app
```

## 📁 Project Structure

```
├── app.js                 # Main application file
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel deployment configuration
├── config/
│   └── cloudinary.js     # Cloudinary configuration
├── controllers/          # Route controllers
├── models/              # MongoDB models
├── routes/              # Express routes
├── middleware/          # Custom middleware
├── views/               # EJS templates
├── assets/              # Static assets (CSS, JS, images)
├── utils/               # Utility functions
└── uploads/             # Local upload directory (dev only)
```

## 🔧 Configuration Files

- **`vercel.json`**: Vercel deployment configuration
- **`package.json`**: Node.js dependencies and scripts
- **`.env`**: Environment variables (local development)
- **`.gitignore`**: Git ignore rules

## 🚀 Deployment Process

### Local Testing
```bash
# Test deployment configuration
node test-deployment.js

# Run in production mode locally
NODE_ENV=production npm start
```

### Vercel Deployment
1. Ensure all environment variables are set in Vercel dashboard
2. Push code to GitHub
3. Vercel will automatically build and deploy
4. Verify deployment at your Vercel URL

## 📊 Monitoring & Debugging

### Vercel Logs
```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs your-deployment-url
```

### Local Debugging
```bash
# Enable debug logging
LOG_LEVEL=debug npm start
```

## 🔒 Security Features

- **Environment Variables**: Sensitive data stored securely
- **Session Management**: MongoDB-based session storage
- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Cloudinary integration with validation

## 📖 API Endpoints

### Public Routes
- `GET /` - Homepage
- `POST /contact` - Contact form submission

### Admin Routes (Protected)
- `GET /admin` - Admin dashboard
- `POST /admin/login` - Admin login
- `GET /admin/logout` - Admin logout
- Admin CRUD operations for all content types

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For deployment issues or questions:
1. Check the `DEPLOYMENT_CHECKLIST.md`
2. Review Vercel logs
3. Verify all environment variables
4. Test locally first

---

**Ready for Vercel Deployment! 🚀**

Your Node.js portfolio project is now configured and ready for serverless deployment on Vercel.
