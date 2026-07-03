import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protect dashboard route to enforce tenant boundaries
router.get('/', protect, getDashboardStats);

export default router;
