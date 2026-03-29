import { Router } from 'express';
import { getMyReferralLink, useReferralCode } from '../controllers/referral.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// GET /api/referral/my-link
router.get('/my-link', protect, getMyReferralLink);

// POST /api/referral/use
router.post('/use', protect, useReferralCode);

export default router;

