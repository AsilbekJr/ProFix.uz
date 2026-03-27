import { Router } from 'express';
import { register, login, telegramAuth } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, telegramAuthSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/telegram', validate(telegramAuthSchema), telegramAuth);

export default router;
