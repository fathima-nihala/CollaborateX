// src/routes/auth.routes.ts
import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { validateBody } from '../middleware/validation';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '../schemas/validation';
import { authenticateToken } from '../middleware/auth';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Public routes
router.post('/register', validateBody(RegisterSchema), asyncHandler(authController.register));
router.post('/login', validateBody(LoginSchema), asyncHandler(authController.login));
router.post('/refresh-token', validateBody(RefreshTokenSchema), asyncHandler(authController.refreshToken));

// Protected routes
router.post('/logout', authenticateToken, asyncHandler(authController.logout));

export default router;
