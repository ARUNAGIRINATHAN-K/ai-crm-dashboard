import { Router } from 'express';
import {
  getLeadSummary,
  generateOutreachEmail,
  getPipelineInsights,
} from '../controllers/ai.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protect all AI assistant routes
router.use(protect);

router.get('/leads/:id/summary', getLeadSummary);
router.post('/leads/:id/email', generateOutreachEmail);
router.get('/pipeline-insights', getPipelineInsights);

export default router;
