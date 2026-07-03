import { Router } from 'express';
import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contact.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Apply auth protection middleware to all contact endpoints
router.use(protect);

router.route('/')
  .get(getContacts)
  .post(createContact);

router.route('/:id')
  .get(getContact)
  .put(updateContact)
  .delete(deleteContact);

export default router;
