import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware';
import {
  getPriceItems,
  createPriceItem,
  updatePriceItem,
  deletePriceItem,
  getPublicPricing,
} from '../controllers/pricing.controller';

const router = Router();

// ── Public (frontend) ─────────────────────────────────────────────────────────
router.get('/', getPublicPricing);

// ── Admin CRUD ────────────────────────────────────────────────────────────────
router.get('/admin', protect, adminOnly, getPriceItems);
router.post('/admin', protect, adminOnly, createPriceItem);
router.put('/admin/:id', protect, adminOnly, updatePriceItem);
router.delete('/admin/:id', protect, adminOnly, deletePriceItem);

export default router;
