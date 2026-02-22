// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { ApiResponse } from '../types';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (error instanceof AppError) {
    logger.warn('Application error', {
      statusCode: error.statusCode,
      message: error.message,
      path: req.path,
      method: req.method,
    });

    const response: ApiResponse = {
      success: false,
      message: error.message,
      errors: error.errors,
    };

    if (isDevelopment) {
      response.stack = error.stack;
    }

    return res.status(error.statusCode || 500).json(response);
  }

  // Handle unexpected errors
  logger.error('Unexpected error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  const response: ApiResponse = {
    success: false,
    message: 'An unexpected error occurred',
  };

  if (isDevelopment) {
    response.stack = error.stack;
  }

  res.status(500).json(response);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.path} not found`,
  };

  res.status(404).json(response);
};
