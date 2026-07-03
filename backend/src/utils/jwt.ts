import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/auth.types';

/**
 * Signs a JWT token containing the user payload.
 */
export const signToken = (payload: UserPayload): string => {
  const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
};

/**
 * Verifies a JWT token signature and decodes the user payload.
 */
export const verifyToken = (token: string): UserPayload => {
  const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production';
  return jwt.verify(token, secret) as UserPayload;
};
