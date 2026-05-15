const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage pour les photos de réalisations
const realisationStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'toucheverte/realisations',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1400, height: 900, crop: 'fill', quality: 'auto' }],
  },
});

// Storage pour les thumbnails admin
const thumbStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'toucheverte/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

const uploadRealisation = multer({
  storage: realisationStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées'), false);
    }
  },
});

module.exports = { cloudinary, uploadRealisation };
