// src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import type { ApiResponse } from '../types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Handle ZodError (in case it escapes validation middleware)
  if (error instanceof ZodError) {
    const errors: Record<string, string> = {};
    const issues = error.issues ?? (error as any).errors ?? [];
    issues.forEach((issue: any) => {
      const path = issue.path?.join('.') || 'value';
      errors[path] = issue.message;
    });

    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      errors,
    };

    if (isDevelopment) response.stack = error.stack;
    return res.status(400).json(response);
  }

  // Handle known AppError (ValidationError, NotFoundError, etc.)
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

    if (isDevelopment) response.stack = error.stack;
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

  if (isDevelopment) response.stack = error.stack;
  res.status(500).json(response);
};

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.path} not found`,
  };

  res.status(404).json(response);
};
