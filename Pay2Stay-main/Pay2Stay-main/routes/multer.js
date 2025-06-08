const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Image Storage (JPEG, PNG only)
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pay2stay/properties/images',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        resource_type: 'image'
    }
});

// PDF Storage (Only PDFs)
const pdfStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pay2stay/properties/agreements',
        allowed_formats: ['pdf'],
        resource_type: 'raw' 
    }
});

// Multer Upload Middleware
const uploadImage = multer({ storage: imageStorage });
const uploadPdf = multer({ storage: pdfStorage });

// Combined Middleware for Handling Image & PDF Uploads
const upload = multer({
    storage: multer.diskStorage({}), 
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// Cloudinary File Upload Function
const uploadToCloudinary = async (file, folder, resourceType) => {
    return await cloudinary.uploader.upload(file.path, {
        folder: folder,
        resource_type: resourceType
    });
};

module.exports = { upload, uploadImage, uploadPdf, uploadToCloudinary, cloudinary };
