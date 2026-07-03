import { Request, Response, NextFunction } from 'express';
import { Lead, LeadStage } from '../models/lead.model';
import { Contact } from '../models/contact.model';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Fetch all leads belonging to the authenticated user.
 */
export const getLeads = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { search, stage } = req.query;

  const filter: any = { ownerId };
  if (stage) {
    filter.stage = stage;
  }
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const leads = await Lead.find(filter).populate('contactId', 'name email company').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: leads.length,
    leads,
  });
});

/**
 * Fetch a single lead belonging to the authenticated user.
 */
export const getLead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;

  const lead = await Lead.findOne({ _id: id, ownerId }).populate('contactId', 'name email company');
  if (!lead) {
    return next(new AppError('No lead found matching this ID.', 404));
  }

  res.status(200).json({
    success: true,
    lead,
  });
});

/**
 * Create a new lead for the authenticated user.
 */
export const createLead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user!.id;
  const { name, value, stage, contactId } = req.body;

  if (!name || value === undefined || !contactId) {
    return next(new AppError('Please provide lead name, deal value, and contactId.', 400));
  }

  // Verify associated contact exists and belongs to the owner
  const contact = await Contact.findOne({ _id: contactId, ownerId });
  if (!contact) {
    return next(new AppError('Invalid contact ID. The contact does not exist or you do not have permission to access it.', 400));
  }

  const newLead = await Lead.create({
    name,
    value,
    stage: stage || 'new',
    contactId,
    ownerId,
  });

  res.status(201).json({
    success: true,
    lead: newLead,
  });
});

/**
 * Update an existing lead belonging to the authenticated user.
 */
export const updateLead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;
  const { name, value, stage, contactId } = req.body;

  // Validate contact identity ownership if it's changing
  if (contactId) {
    const contact = await Contact.findOne({ _id: contactId, ownerId });
    if (!contact) {
      return next(new AppError('Invalid contact ID. The contact does not exist or you do not have access.', 400));
    }
  }

  const lead = await Lead.findOneAndUpdate(
    { _id: id, ownerId },
    { name, value, stage, contactId },
    { new: true, runValidators: true }
  ).populate('contactId', 'name email company');

  if (!lead) {
    return next(new AppError('No lead found matching this ID.', 404));
  }

  res.status(200).json({
    success: true,
    lead,
  });
});

/**
 * Delete a lead belonging to the authenticated user.
 */
export const deleteLead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;

  const lead = await Lead.findOneAndDelete({ _id: id, ownerId });
  if (!lead) {
    return next(new AppError('No lead found matching this ID.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Lead deleted successfully.',
  });
});

/**
 * Update the stage of a lead (Kanban Stage Update).
 */
export const updateLeadStage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;
  const { stage } = req.body;

  const validStages: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  if (!stage || !validStages.includes(stage)) {
    return next(new AppError(`Invalid stage parameter. Must be one of: ${validStages.join(', ')}`, 400));
  }

  const lead = await Lead.findOneAndUpdate(
    { _id: id, ownerId },
    { stage },
    { new: true, runValidators: true }
  ).populate('contactId', 'name email company');

  if (!lead) {
    return next(new AppError('No lead found matching this ID.', 404));
  }

  res.status(200).json({
    success: true,
    lead,
  });
});

/**
 * Bulk delete leads belonging to the authenticated user.
 */
export const deleteLeadsBulk = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user!.id;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new AppError('Please provide an array of lead IDs to delete.', 400));
  }

  await Lead.deleteMany({ _id: { $in: ids }, ownerId });

  res.status(200).json({
    success: true,
    message: 'Leads deleted successfully in bulk.',
  });
});
