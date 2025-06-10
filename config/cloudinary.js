const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for different upload types
const createCloudinaryStorage = (folder, allowedFormats = ['jpg', 'png', 'jpeg', 'gif', 'webp']) => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: folder,
            allowed_formats: allowedFormats,
            transformation: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto' }
            ]
        }
    });
};

// Different storage configurations
const storageConfigs = {
    profiles: createCloudinaryStorage('portfolio/profiles'),
    logos: createCloudinaryStorage('portfolio/logos'),
    portfolio: createCloudinaryStorage('portfolio/gallery'),
    skills: createCloudinaryStorage('portfolio/skills'),
    testimonials: createCloudinaryStorage('portfolio/testimonials'),
    socialIcons: createCloudinaryStorage('portfolio/social-icons'),
    cvs: createCloudinaryStorage('portfolio/cvs', ['pdf', 'doc', 'docx'])
};

// Create multer upload instances
const uploads = {
    profile: multer({ storage: storageConfigs.profiles }),
    logo: multer({ storage: storageConfigs.logos }),
    portfolio: multer({ storage: storageConfigs.portfolio }),
    skill: multer({ storage: storageConfigs.skills }),
    testimonial: multer({ storage: storageConfigs.testimonials }),
    socialIcon: multer({ storage: storageConfigs.socialIcons }),
    cv: multer({ storage: storageConfigs.cvs })
};

// Generic upload for mixed types
const genericUpload = multer({
    storage: createCloudinaryStorage('portfolio/uploads')
});

module.exports = {
    cloudinary,
    uploads,
    genericUpload,
    createCloudinaryStorage
};
