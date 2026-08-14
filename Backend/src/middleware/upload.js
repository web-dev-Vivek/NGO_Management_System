import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload folders exist
const createFolderIfNotExist = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

// Storage configurations
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = 'uploads/';
        if (file.fieldname === 'banner') {
            dest = 'uploads/campaigns/';
        } else if (file.fieldname === 'certificate') {
            dest = 'uploads/certificates/';
        }
        createFolderIfNotExist(dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Image filter for campaign banners
const imageFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
    }
};

// PDF filter for certificates
const pdfFilter = (req, file, cb) => {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'));
    }
};

// Exported Multer Middlewares
export const uploadCampaignBanner = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: imageFilter
}).single('banner');

export const uploadCertificateFile = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: pdfFilter
}).single('certificate');
