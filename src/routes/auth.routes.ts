import { Router } from 'express';
import { register, login, telegramAuth } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/telegram', telegramAuth);

export default router;
