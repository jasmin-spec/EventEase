const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

require('dotenv').config();

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check Cloudinary configuration
console.log('===== CLOUDINARY CONFIG =====');
console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API key exists:', !!process.env.CLOUDINARY_API_KEY);
console.log('API secret exists:', !!process.env.CLOUDINARY_API_SECRET);

// ============================================
// CLOUDINARY STORAGE
// ============================================

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,

  params: {
    folder: 'event-app-uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

// ============================================
// MULTER
// ============================================

const upload = multer({
  storage: storage,

  limits: {
   fileSize: 10 * 1024 * 1024, // Maximum 10 MB
  },

  fileFilter: (req, file, cb) => {
    console.log('===== FILE RECEIVED =====');
    console.log('File name:', file.originalname);
    console.log('File type:', file.mimetype);

    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }

    cb(null, true);
  }
});

module.exports = upload;