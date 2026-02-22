// src/middleware/validation.ts
import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

const extractZodErrors = (error: ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  // Zod v4 uses .issues, Zod v3 uses .errors — support both
  const issues = error.issues ?? (error as any).errors ?? [];
  issues.forEach((issue: any) => {
    const path = issue.path?.join('.') || 'value';
    errors[path] = issue.message;
  });
  return errors;
};

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = {
        body: req.body,
        params: req.params,
        query: req.query,
      };

      const validated = schema.parse(data);
      req.body = validated.body || req.body;
      req.params = validated.params || req.params;
      req.query = validated.query || req.query;

      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        next(new ValidationError(extractZodErrors(error)));
      } else {
        next(error);
      }
    }
  };
};

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        next(new ValidationError(extractZodErrors(error)));
      } else {
        next(error);
      }
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        next(new ValidationError(extractZodErrors(error)));
      } else {
        next(error);
      }
    }
  };
};
