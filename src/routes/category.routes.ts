import { Router } from 'express';
import { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/category.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
