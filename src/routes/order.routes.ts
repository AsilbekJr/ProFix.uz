import { Router } from 'express';
import { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder,
  getOpenTenders
} from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';
import { uploadOrderPhotos } from '../middleware/upload.middleware';

const router = Router();

router.use(protect);

router.post('/', uploadOrderPhotos, createOrder);
router.get('/my', getMyOrders);
router.get('/tenders', getOpenTenders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', cancelOrder);

export default router;
