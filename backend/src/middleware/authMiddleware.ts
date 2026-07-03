import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Route protection middleware. Checks Authorization header for Bearer token,
 * validates it, checks if the user exists, and appends user to req.user.
 */
export const protect = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Extract bearer token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Authentication failed. No token provided.', 401));
  }

  // Decode/Verify JWT token
  const decodedPayload = verifyToken(token);

  // Verify the user still exists in the database
  const currentUser = await User.findById(decodedPayload.id);
  if (!currentUser) {
    return next(new AppError('The user associated with this credentials no longer exists.', 401));
  }

  // Assign verified user identity to Request
  req.user = {
    id: currentUser.id,
    email: currentUser.email,
    role: currentUser.role,
  };

  next();
});

/**
 * Restricts access to specific user roles (RBAC).
 */
export const restrictTo = (...roles: Array<'user' | 'admin'>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as any)) {
      return next(new AppError('Permission denied. You do not have access to this action.', 403));
    }
    next();
  };
};
