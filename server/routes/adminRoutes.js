import express from 'express';
import { protect } from '../middleware/auth.js';
import { getAllPayments, deletePayment } from '../controllers/adminPaymentController.js';

const router = express.Router();
router.use(protect);

router.get('/payments', getAllPayments);
router.delete('/payments/:id', deletePayment);

export default router;