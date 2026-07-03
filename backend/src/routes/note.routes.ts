import { Router } from 'express';
import {
  getLeadNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/note.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Require authorization for all note routes
router.use(protect);

router.route('/')
  .get(getLeadNotes)
  .post(createNote);

router.route('/:id')
  .put(updateNote)
  .delete(deleteNote);

export default router;
