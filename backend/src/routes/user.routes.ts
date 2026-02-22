import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';
import * as userController from '../controllers/user.controller';

const router = Router();

router.use(authenticateToken);

router.get('/search', asyncHandler(userController.searchUsers));

export default router;
