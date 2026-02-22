// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { RegisterInput, LoginInput, RefreshTokenSchema } from '../schemas/validation';
import { ApiResponse } from '../types';
import logger from '../utils/logger';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, username, password, firstName, lastName } = req.body as RegisterInput;

      const user = await authService.register(email, username, password, firstName, lastName);

      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully',
        data: user,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as LoginInput;

      const result = await authService.login(email, password);

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = RefreshTokenSchema.parse(req.body);
      const tokens = await authService.refreshToken(validated.refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { refreshToken } = req.body;
      await authService.logout(req.user.id, refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
