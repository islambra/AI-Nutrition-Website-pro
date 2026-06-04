import express from 'express';
import { protect } from '../middleware/auth.js';
import { getDieteticienPlanPayments } from '../controllers/dieteticienPaymentController.js';

const router = express.Router();
router.use(protect);
router.get('/payments/my-plan-payments', getDieteticienPlanPayments);

export default router;