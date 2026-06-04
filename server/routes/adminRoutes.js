import express from 'express';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { getAllPayments, deletePayment } from '../controllers/adminPaymentController.js';
import {
  getPendingDieteticiens,
  approveDieteticien,
  rejectDieteticien
} from '../controllers/adminDieteticienController.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/payments', getAllPayments);
router.delete('/payments/:id', deletePayment);

router.get('/dieteticiens/pending', getPendingDieteticiens);
router.post('/dieteticiens/approve/:id', approveDieteticien);
router.delete('/dieteticiens/reject/:id', rejectDieteticien);

export default router;