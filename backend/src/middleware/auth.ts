// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { RequestUser, UserRole } from '../types';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('Access token is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as RequestUser;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Token expired', { error: error.message });
      next(new AuthenticationError('Token expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token', { error: error.message });
      next(new AuthenticationError('Invalid token'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      logger.warn('Authorization failed', {
        userId: req.user.id,
        userRole: req.user.role,
        allowedRoles,
      });
      return next(
        new AuthorizationError('You do not have permission to access this resource')
      );
    }

    next();
  };
};

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Implemented via express-rate-limit in the app setup
  next();
};
