// src/routes/auth.routes.ts
import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '../schemas/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateBody(RegisterSchema), authController.register.bind(authController));
router.post('/login', validateBody(LoginSchema), authController.login.bind(authController));
router.post('/refresh-token', validateBody(RefreshTokenSchema), authController.refreshToken.bind(authController));

// Protected routes
router.post('/logout', authenticateToken, authController.logout.bind(authController));

export default router;
