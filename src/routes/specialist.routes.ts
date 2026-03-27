import { Router } from 'express';
import {
  getSpecialists,
  getSpecialistById,
  applyAsSpecialist,
  verifySpecialist,
  unverifySpecialist,
  updateSpecialistProfile
} from '../controllers/specialist.controller';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.middleware';
import { uploadSpecialistDocs } from '../middleware/upload.middleware';

const router = Router();

// Public (optionalAuth orqali telefon raqam yashirilishini boshqaramiz)
router.get('/', optionalAuth, getSpecialists);

// Protected — /me dan oldin bo'lishi shart (/:id bilan ziddiyat bo'lmasligi uchun)
router.put('/me', protect, updateSpecialistProfile);
router.post('/apply', protect, uploadSpecialistDocs, applyAsSpecialist);

// Public (ID bo'yicha)
router.get('/:id', optionalAuth, getSpecialistById);

// Admin routes
router.put('/:id/verify', protect, adminOnly, verifySpecialist);
router.put('/:id/unverify', protect, adminOnly, unverifySpecialist);

export default router;

