import { Request, Response, NextFunction } from 'express';
import { Contact } from '../models/contact.model';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Fetch all contacts belonging to the authenticated user.
 */
export const getContacts = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const contacts = await Contact.find({ ownerId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: contacts.length,
    contacts,
  });
});

/**
 * Fetch a single contact belonging to the authenticated user.
 */
export const getContact = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;

  const contact = await Contact.findOne({ _id: id, ownerId });
  if (!contact) {
    return next(new AppError('No contact found matching this ID.', 404));
  }

  res.status(200).json({
    success: true,
    contact,
  });
});

/**
 * Create a new contact for the authenticated user.
 */
export const createContact = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user!.id;
  const { name, email, phone, company, isFavorite, tags } = req.body;

  if (!name || !email) {
    return next(new AppError('Please provide both a name and an email address for the contact.', 400));
  }

  const newContact = await Contact.create({
    name,
    email,
    phone: phone || '',
    company: company || '',
    isFavorite: !!isFavorite,
    tags: Array.isArray(tags) ? tags : [],
    ownerId,
  });

  res.status(201).json({
    success: true,
    contact: newContact,
  });
});

/**
 * Update an existing contact belonging to the authenticated user.
 */
export const updateContact = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;
  const { name, email, phone, company, isFavorite, tags } = req.body;

  const contact = await Contact.findOneAndUpdate(
    { _id: id, ownerId },
    { name, email, phone, company, isFavorite, tags },
    { new: true, runValidators: true }
  );

  if (!contact) {
    return next(new AppError('No contact found matching this ID.', 404));
  }

  res.status(200).json({
    success: true,
    contact,
  });
});

/**
 * Delete a contact belonging to the authenticated user.
 */
export const deleteContact = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;

  const contact = await Contact.findOneAndDelete({ _id: id, ownerId });
  if (!contact) {
    return next(new AppError('No contact found matching this ID.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Contact deleted successfully.',
  });
});
