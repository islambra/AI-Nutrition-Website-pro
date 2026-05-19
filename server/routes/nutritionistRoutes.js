import express from 'express';
import { protect } from '../middleware/auth.js';
import { getNutritionistPlanPayments } from '../controllers/nutritionistPaymentController.js';

const router = express.Router();
router.use(protect);
router.get('/payments/my-plan-payments', getNutritionistPlanPayments);

export default router;