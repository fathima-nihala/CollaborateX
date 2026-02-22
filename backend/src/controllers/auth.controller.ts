// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import authService from '../services/auth.service';
import type { RegisterInput, LoginInput } from '../schemas/validation';
import { RefreshTokenSchema } from '../schemas/validation';
import type { ApiResponse } from '../types';
import logger from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  const { email, username, password, firstName, lastName } = req.body as RegisterInput;
  const user = await authService.register(email, username, password, firstName, lastName);

  const response: ApiResponse = {
    success: true,
    message: 'User registered successfully',
    data: user,
  };

  res.status(201).json(response);
};

export const login = async (req: Request, res: Response) => {
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
};

export const refreshToken = async (req: Request, res: Response) => {
  const validated = RefreshTokenSchema.parse(req.body);
  const tokens = await authService.refreshToken(validated.refreshToken);

  const response: ApiResponse = {
    success: true,
    message: 'Token refreshed successfully',
    data: { tokens },
  };

  res.status(200).json(response);
};

export const logout = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  // refreshToken is optional — if not provided, all sessions for this user are cleared
  const refreshToken: string | undefined = req.body?.refreshToken;

  await authService.logout(req.user.id, refreshToken);

  logger.info('User logged out', { userId: req.user.id });

  const response: ApiResponse = {
    success: true,
    message: 'Logged out successfully',
  };

  res.status(200).json(response);
};
