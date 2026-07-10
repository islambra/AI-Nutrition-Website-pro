import multer from "multer";
import { securityLogger } from "./securityLogger.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    securityLogger.fileUpload(req.user?._id, file.originalname, file.size, 'rejected_pdf_mime');
    return cb(new Error('Only PDF files are allowed'), false);
  }
  if (!file.originalname.toLowerCase().endsWith('.pdf')) {
    securityLogger.fileUpload(req.user?._id, file.originalname, file.size, 'rejected_pdf_ext');
    return cb(new Error('File must have .pdf extension'), false);
  }
  cb(null, true);
};

const uploadPdf = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

export const uploadMultiplePdf = uploadPdf.array('pdfFiles', 10);

export default uploadPdf;
