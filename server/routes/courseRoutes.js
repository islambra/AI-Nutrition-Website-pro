import express from 'express';
import { protect } from '../middleware/auth.js';
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

const router = express.Router();

// Public route (no auth needed)
router.get('/platform-payment-info', getPlatformPaymentInfo);

router.use(protect);

router.post('/', uploadPdf.single('pdfFile'), createCourse);
router.get('/', getAllCourses);
router.get('/level/:level', getCoursesByLevel);
router.delete('/:id', deleteCourse);

// Course subscription routes
router.post('/subscribe', upload.single('proofImage'), initiateCourseSubscription);
router.get('/check-access', checkCourseAccess);
router.get('/my-subscription', getMySubscription);

export default router;
