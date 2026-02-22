// src/routes/task.routes.ts
import { Router } from 'express';
import taskController from '../controllers/task.controller';
import { validateBody } from '../middleware/validation';
import { CreateTaskSchema, UpdateTaskSchema } from '../schemas/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router({ mergeParams: true });

// All task routes require authentication
router.use(authenticateToken);

// Task CRUD
router.post('/', validateBody(CreateTaskSchema), taskController.createTask.bind(taskController));
router.get('/', taskController.getProjectTasks.bind(taskController));
router.get('/:taskId', taskController.getTask.bind(taskController));
router.put('/:taskId', validateBody(UpdateTaskSchema), taskController.updateTask.bind(taskController));
router.delete('/:taskId', taskController.deleteTask.bind(taskController));

export default router;
