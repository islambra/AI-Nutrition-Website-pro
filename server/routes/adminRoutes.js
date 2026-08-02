import express from 'express';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import {
  getAllPayments,
  deletePayment,
  getPendingCourseSubscriptions,
  approveCourseSubscription,
  rejectCourseSubscription,
  getPendingAiToolSubscriptions,
  approveAiToolSubscription,
  rejectAiToolSubscription
} from '../controllers/adminPaymentController.js';
import {
  getPendingDieteticiens,
  approveDieteticien,
  rejectDieteticien
} from '../controllers/adminDieteticienController.js';
import {
  getPlatformPaymentInfo,
  updatePlatformPaymentInfo
} from '../controllers/adminPlatformPaymentController.js';
import { getAllFormationsAdmin } from '../controllers/formationController.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/payments', getAllPayments);
router.delete('/payments/:id', deletePayment);

router.get('/dieteticiens/pending', getPendingDieteticiens);
router.post('/dieteticiens/approve/:id', approveDieteticien);
router.delete('/dieteticiens/reject/:id', rejectDieteticien);

// Course subscription management
router.get('/course-subscriptions/pending', getPendingCourseSubscriptions);
router.post('/course-subscriptions/approve/:id', approveCourseSubscription);
router.post('/course-subscriptions/reject/:id', rejectCourseSubscription);

// AI tool subscription management
router.get('/ai-tool-subscriptions/pending', getPendingAiToolSubscriptions);
router.post('/ai-tool-subscriptions/approve/:id', approveAiToolSubscription);
router.post('/ai-tool-subscriptions/reject/:id', rejectAiToolSubscription);

// Platform payment info management
router.get('/platform-payment-info', getPlatformPaymentInfo);
router.put('/platform-payment-info', updatePlatformPaymentInfo);

// Content management (all formations regardless of status)
router.get('/content/formations', getAllFormationsAdmin);

export default router;