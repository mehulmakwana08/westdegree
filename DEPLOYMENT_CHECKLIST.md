# Vercel Deployment Checklist

## Pre-Deployment Steps

### 1. Environment Setup
- [ ] Create a Cloudinary account at https://cloudinary.com/
- [ ] Set up MongoDB Atlas database
- [ ] Generate secure session secret
- [ ] Create Gmail app password for email functionality

### 2. Repository Setup
- [ ] Push code to GitHub repository
- [ ] Ensure `.env` file is in `.gitignore`
- [ ] Verify all sensitive data is removed from code

### 3. Vercel Configuration
- [ ] Create Vercel account
- [ ] Import GitHub repository to Vercel
- [ ] Configure environment variables in Vercel dashboard

## Required Environment Variables for Vercel

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
SESSION_SECRET=your-super-secure-session-secret-at-least-32-chars
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CONTACT_EMAIL=your-contact-email@gmail.com
SITE_NAME=Your Portfolio Name
SITE_URL=https://your-vercel-domain.vercel.app
```

## Deployment Process

### 1. Vercel Dashboard Setup
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables
5. Deploy

### 2. Database Configuration
1. In MongoDB Atlas, add Vercel's IP ranges or use 0.0.0.0/0
2. Ensure database user has read/write permissions
3. Test connection string

### 3. Cloudinary Setup
1. Create upload presets for different file types
2. Configure transformation settings
3. Test file upload functionality

## Post-Deployment Verification

- [ ] Website loads correctly
- [ ] Admin login works
- [ ] File uploads work through Cloudinary
- [ ] Contact form sends emails
- [ ] Database operations function properly
- [ ] All routes are accessible

## Troubleshooting

### Common Issues:
1. **MongoDB Connection**: Verify connection string and IP whitelist
2. **File Uploads**: Check Cloudinary credentials and configuration
3. **Sessions**: Ensure MongoDB store is working
4. **Email**: Verify Gmail app password and settings
5. **Environment Variables**: Check all required variables are set

### Debug Commands:
```bash
# Check Vercel logs
vercel logs your-deployment-url

# Test locally with production env
npm start
```

## Additional Optimizations

### Performance
- [ ] Enable Vercel Analytics
- [ ] Configure CDN for static assets
- [ ] Optimize images through Cloudinary

### Security
- [ ] Enable HTTPS redirects
- [ ] Configure security headers
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerts

### SEO
- [ ] Configure meta tags
- [ ] Add sitemap.xml
- [ ] Implement structured data
- [ ] Optimize page loading speeds
