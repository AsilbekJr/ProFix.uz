import { Router } from 'express';
import { createReview, getSpecialistReviews, getOrderReview } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Sharh yaratish — faqat autentifikatsiya qilingan mijoz
router.post('/', protect, createReview);

// Usta sharhlarini olish — ochiq
router.get('/specialist/:specialistId', getSpecialistReviews);

// Buyurtmaning sharhini olish — ochiq  
router.get('/order/:orderId', getOrderReview);

export default router;
