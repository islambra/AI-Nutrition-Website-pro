import express from 'express';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import {
  getPlatformPaymentInfo,
  initiateAiToolSubscription,
  checkAiToolAccess,
  getMySubscription
} from '../controllers/aiToolController.js';
import { validatePayment } from '../middleware/validate.js';

const router = express.Router();

router.get('/platform-payment-info', getPlatformPaymentInfo);

router.use(protect);

router.post('/subscribe', upload.single('proofImage'), validatePayment, initiateAiToolSubscription);
router.get('/check-access', checkAiToolAccess);
router.get('/my-subscription', getMySubscription);

export default router;
