import { Request, Response, NextFunction } from 'express';
import { Note } from '../models/note.model';
import { Lead } from '../models/lead.model';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Fetch all notes for a specific lead belonging to the user.
 */
export const getLeadNotes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user!.id;
  const { leadId } = req.query;

  if (!leadId) {
    return next(new AppError('Please specify a leadId query parameter to fetch notes.', 400));
  }

  const notes = await Note.find({ leadId, ownerId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: notes.length,
    notes,
  });
});

/**
 * Create a new note under a lead.
 */
export const createNote = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user!.id;
  const { content, leadId } = req.body;

  if (!content || !leadId) {
    return next(new AppError('Please provide both content and a leadId to create a note.', 400));
  }

  // Ensure lead exists and belongs to the owner
  const lead = await Lead.findOne({ _id: leadId, ownerId });
  if (!lead) {
    return next(new AppError('Invalid lead ID. The lead does not exist or is unauthorized.', 400));
  }

  const newNote = await Note.create({
    content,
    leadId,
    ownerId,
  });

  res.status(201).json({
    success: true,
    note: newNote,
  });
});

/**
 * Update the contents of a note.
 */
export const updateNote = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;
  const { content } = req.body;

  if (!content) {
    return next(new AppError('Please provide content for the note update.', 400));
  }

  const note = await Note.findOneAndUpdate(
    { _id: id, ownerId },
    { content },
    { new: true, runValidators: true }
  );

  if (!note) {
    return next(new AppError('No note found matching this ID.', 404));
  }

  res.status(200).json({
    success: true,
    note,
  });
});

/**
 * Delete a note.
 */
export const deleteNote = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;

  const note = await Note.findOneAndDelete({ _id: id, ownerId });
  if (!note) {
    return next(new AppError('No note found matching this ID.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Note deleted successfully.',
  });
});
