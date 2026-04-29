const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Profile Photo Storage
const profilePhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jobportal/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }]
  }
});

// Resume Storage
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jobportal/resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw'
  }
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for profile photos'), false);
  }
};

// File filter for resumes
const resumeFileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes'), false);
  }
};

// Upload middlewares
exports.uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('photo');

exports.uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('resume');

// Error handling middleware for multer
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

