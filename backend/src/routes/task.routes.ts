import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { validateBody } from '../middleware/validation';
import { CreateTaskSchema, UpdateTaskSchema } from '../schemas/validation';
import { authenticateToken } from '../middleware/auth';
import * as taskController from '../controllers/task.controller';

const router = Router({ mergeParams: true });

// All task routes require authentication
router.use(authenticateToken);

// Task CRUD
router.post('/', validateBody(CreateTaskSchema), asyncHandler(taskController.createTask));
router.get('/', asyncHandler(taskController.getProjectTasks));
router.get('/:taskId', asyncHandler(taskController.getTask));
router.put('/:taskId', validateBody(UpdateTaskSchema), asyncHandler(taskController.updateTask));
router.delete('/:taskId', asyncHandler(taskController.deleteTask));

export default router;
