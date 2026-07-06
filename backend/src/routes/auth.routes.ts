import { Router } from 'express';
import { register, login, getMe, guestLogin } from '../controllers/auth.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/guest-login', guestLogin);

// Protected auth endpoints
router.get('/me', protect, getMe);

export default router;
