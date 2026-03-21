import { Router } from 'express';
import { getAdminStats, getAdminUsers, deleteAdminUser, getAdminOrders } from '../controllers/admin.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.delete('/users/:id', deleteAdminUser);
router.get('/orders', getAdminOrders);

export default router;
