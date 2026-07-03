import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { signToken } from '../utils/jwt';

/**
 * Controller handles registering new users.
 */
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Missing required credentials (name, email, password).', 400));
  }

  // Verify email is not already in use
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('The email address provided is already registered.', 400));
  }

  // Create new user record
  const newUser = await User.create({
    name,
    email,
    password,
    role: role || 'user',
  });

  // Generate JWT access token
  const token = signToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

/**
 * Controller handles logging in existing users.
 */
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide both email and password.', 400));
  }

  // Query user, explicitly requesting the password hash (which is select: false)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password details.', 401));
  }

  // Generate JWT access token
  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * Controller fetches the current user profile based on the JWT payload.
 */
export const getMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Access denied. Authentication context is missing.', 401));
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('No active user accounts found matching this token ID.', 404));
  }

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});
