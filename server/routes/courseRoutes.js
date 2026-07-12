import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { uploadMultiplePdf } from '../middleware/multerPdf.js';
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
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Public route with caching
router.get('/platform-payment-info', cacheMiddleware(300000), getPlatformPaymentInfo);

router.use(protect);

router.post('/', authorize('admin', 'dieteticien'), uploadMultiplePdf, validateCourse, createCourse);
router.get('/', cacheMiddleware(30000), getAllCourses);
router.get('/level/:level', cacheMiddleware(30000), getCoursesByLevel);
router.delete('/:id', deleteCourse);

router.post('/subscribe', upload.single('proofImage'), validatePayment, initiateCourseSubscription);
router.get('/check-access', checkCourseAccess);
router.get('/my-subscription', getMySubscription);

export default router;
