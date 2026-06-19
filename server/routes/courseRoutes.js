import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import uploadPdf from '../middleware/multerPdf.js';
import upload from '../middleware/multer.js';
import {
  createCourse,
  getAllCourses,
  getCoursesByLevel,
  deleteCourse,
  getPlatformPaymentInfo,
  initiateCourseSubscription,
  checkCourseAccess,
  getMySubscription
} from '../controllers/courseControllers.js';
import { validateCourse, validatePayment } from '../middleware/validate.js';

const router = express.Router();

// Public route
router.get('/platform-payment-info', getPlatformPaymentInfo);

router.use(protect);

router.post('/', authorize('admin', 'dieteticien'), uploadPdf.single('pdfFile'), validateCourse, createCourse);
router.get('/', getAllCourses);
router.get('/level/:level', getCoursesByLevel);
router.delete('/:id', deleteCourse);

router.post('/subscribe', upload.single('proofImage'), validatePayment, initiateCourseSubscription);
router.get('/check-access', checkCourseAccess);
router.get('/my-subscription', getMySubscription);

export default router;
