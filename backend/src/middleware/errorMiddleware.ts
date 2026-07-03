import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

/**
 * Express error-handling middleware. Converts database, JWT, and runtime exceptions
 * into structured API error responses.
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log details locally
  console.error('ErrorHandler Caught:', err);

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with ID of ${err.value}`;
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const fieldName = Object.keys(err.keyValue || {}).join(', ') || 'field';
    const message = `Duplicate value entered for ${fieldName}`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(', ');
    error = new AppError(message, 400);
  }

  // JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your authentication token has expired. Please log in again.', 401);
  }

  const isDev = process.env.NODE_ENV === 'development';

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack }),
  });
};
