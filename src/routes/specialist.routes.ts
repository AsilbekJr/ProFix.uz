import { Router } from 'express';
import {
  getSpecialists,
  getSpecialistById,
  rateSpecialist,
  applyAsSpecialist,
  verifySpecialist,
  unverifySpecialist
} from '../controllers/specialist.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/', getSpecialists);
router.get('/:id', getSpecialistById);

router.post('/:id/rate', protect, rateSpecialist);
router.post('/apply', protect, upload.array('documents', 5), applyAsSpecialist);

// Admin routes
router.put('/:id/verify', protect, adminOnly, verifySpecialist);
router.put('/:id/unverify', protect, adminOnly, unverifySpecialist);   // 🆕 Tasdiqlashni bekor qilish

export default router;
