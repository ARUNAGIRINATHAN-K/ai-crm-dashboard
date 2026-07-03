import { Request, Response, NextFunction } from 'express';
import { Lead } from '../models/lead.model';
import { Note } from '../models/note.model';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import * as aiService from '../services/ai.service';

/**
 * Controller generates an AI-driven summary for a lead.
 */
export const getLeadSummary = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;

  // Fetch lead and contact parameters
  const lead = await Lead.findOne({ _id: id, ownerId }).populate('contactId', 'name company');
  if (!lead) {
    return next(new AppError('No lead found matching this ID.', 404));
  }

  // Fetch associated notes to build history context
  const notes = await Note.find({ leadId: id, ownerId }).sort({ createdAt: -1 });

  const contact = (lead.contactId as any) || { name: 'Unknown', company: 'Unknown' };
  const notesTexts = notes.map(n => n.content);

  const summary = await aiService.generateLeadSummary(
    lead.name,
    lead.value,
    lead.stage,
    contact.name,
    contact.company,
    notesTexts
  );

  res.status(200).json({
    success: true,
    summary,
  });
});

/**
 * Controller generates a customized outreach email draft based on lead logs and prompts.
 */
export const generateOutreachEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;
  const { promptInstruction } = req.body;

  if (!promptInstruction) {
    return next(new AppError('Please provide a promptInstruction detailing the outreach objective.', 400));
  }

  // Fetch lead and contact parameters
  const lead = await Lead.findOne({ _id: id, ownerId }).populate('contactId', 'name company');
  if (!lead) {
    return next(new AppError('No lead found matching this ID.', 404));
  }

  // Fetch associated notes
  const notes = await Note.find({ leadId: id, ownerId }).sort({ createdAt: -1 });

  const contact = (lead.contactId as any) || { name: 'Unknown', company: 'Unknown' };
  const notesTexts = notes.map(n => n.content);

  const emailDraft = await aiService.generateEmailDraft(
    lead.name,
    contact.name,
    contact.company,
    promptInstruction,
    notesTexts
  );

  res.status(200).json({
    success: true,
    email: emailDraft,
  });
});

/**
 * Controller scans pipeline deals list and generates AI health insights.
 */
export const getPipelineInsights = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;

  // Retrieve active leads list for evaluation
  const leads = await Lead.find({ ownerId });

  const dealData = leads.map(l => ({
    name: l.name,
    value: l.value,
    stage: l.stage,
  }));

  const insights = await aiService.generatePipelineInsights(dealData);

  res.status(200).json({
    success: true,
    insights,
  });
});
