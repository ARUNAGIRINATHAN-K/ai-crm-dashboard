import { Router } from 'express';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStage,
  deleteLeadsBulk,
} from '../controllers/lead.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Require authorization for all lead routes
router.use(protect);

router.post('/bulk-delete', deleteLeadsBulk);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(deleteLead);

router.patch('/:id/stage', updateLeadStage);

export default router;
