import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/task.model';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Fetch all tasks belonging to the authenticated user.
 * Optional query parameter `leadId` filters tasks for a specific deal.
 */
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { leadId } = req.query;

  const filter: any = { ownerId };
  if (leadId) {
    filter.leadId = leadId;
  }

  const tasks = await Task.find(filter).populate('leadId', 'name stage').sort({ dueDate: 1 });

  res.status(200).json({
    success: true,
    results: tasks.length,
    tasks,
  });
});

/**
 * Fetch a single task by ID.
 */
export const getTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;

  const task = await Task.findOne({ _id: id, ownerId }).populate('leadId', 'name stage');
  if (!task) {
    return next(new AppError('No task found matching this ID.', 404));
  }

  res.status(200).json({
    success: true,
    task,
  });
});

/**
 * Create a new task.
 */
export const createTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user!.id;
  const { title, description, dueDate, status, leadId } = req.body;

  if (!title || !dueDate) {
    return next(new AppError('Please provide both a title and a due date for the task.', 400));
  }

  const newTask = await Task.create({
    title,
    description: description || '',
    dueDate,
    status: status || 'pending',
    leadId: leadId || null,
    ownerId,
  });

  res.status(201).json({
    success: true,
    task: newTask,
  });
});

/**
 * Update an existing task.
 */
export const updateTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;
  const { title, description, dueDate, status, leadId } = req.body;

  const task = await Task.findOneAndUpdate(
    { _id: id, ownerId },
    { title, description, dueDate, status, leadId: leadId === '' ? null : leadId },
    { new: true, runValidators: true }
  ).populate('leadId', 'name stage');

  if (!task) {
    return next(new AppError('No task found matching this ID.', 404));
  }

  res.status(200).json({
    success: true,
    task,
  });
});

/**
 * Delete an existing task.
 */
export const deleteTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const ownerId = req.user!.id;

  const task = await Task.findOneAndDelete({ _id: id, ownerId });
  if (!task) {
    return next(new AppError('No task found matching this ID.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully.',
  });
});
