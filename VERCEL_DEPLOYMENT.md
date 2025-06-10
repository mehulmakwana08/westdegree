# Vercel Deployment Guide for Dynamic Portfolio

## Prerequisites
1. Vercel account
2. GitHub repository
3. MongoDB Atlas database
4. Cloudinary account (for file uploads)

## Environment Variables Setup

Add these environment variables in your Vercel dashboard:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=your_secure_session_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CONTACT_EMAIL=your_contact_email@gmail.com
SITE_NAME=Your Portfolio Name
SITE_URL=https://your-vercel-domain.vercel.app
```

## Deployment Steps

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect to Vercel**: Import your GitHub repository in Vercel
3. **Set Environment Variables**: Add all required environment variables
4. **Deploy**: Vercel will automatically build and deploy

## Important Notes

- File uploads are handled by Cloudinary (cloud storage)
- Sessions use connect-mongo for MongoDB storage
- Logs are handled by Vercel's built-in logging
- Static assets are served by Vercel's CDN

## File Upload Migration

The project has been updated to use Cloudinary instead of local file storage for Vercel compatibility.

## Database

Ensure your MongoDB Atlas cluster allows connections from all IPs (0.0.0.0/0) or configure Vercel's IP ranges.
