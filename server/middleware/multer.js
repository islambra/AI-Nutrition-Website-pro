import multer from "multer";
import { securityLogger } from "./securityLogger.js";

const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'application/pdf'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.jpe', '.jfif', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.pdf'];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    securityLogger.fileUpload(req.user?._id, file.originalname, file.size, 'rejected_mime');
    return cb(new Error('Only JPEG, PNG, GIF, WebP images and PDF files are allowed'), false);
  }
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    securityLogger.fileUpload(req.user?._id, file.originalname, file.size, 'rejected_extension');
    return cb(new Error(`File extension ${ext} is not allowed`), false);
  }
  if (file.mimetype === 'image/svg+xml') {
    securityLogger.fileUpload(req.user?._id, file.originalname, file.size, 'rejected_svg');
    return cb(new Error('SVG files are not allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export default upload;
