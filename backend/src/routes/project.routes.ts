import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { validateBody } from '../middleware/validation';
import { CreateProjectSchema, UpdateProjectSchema, AddProjectMemberSchema } from '../schemas/validation';
import { authenticateToken } from '../middleware/auth';
import * as projectController from '../controllers/project.controller';

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

// Project CRUD
router.post('/', validateBody(CreateProjectSchema), asyncHandler(projectController.createProject));
router.get('/', asyncHandler(projectController.getUserProjects));
router.get('/:id', asyncHandler(projectController.getProject));
router.put('/:id', validateBody(UpdateProjectSchema), asyncHandler(projectController.updateProject));
router.delete('/:id', asyncHandler(projectController.deleteProject));

// Project membership
router.post('/:projectId/members', validateBody(AddProjectMemberSchema), asyncHandler(projectController.addMember));
router.delete('/:projectId/members/:memberId', asyncHandler(projectController.removeMember));

export default router;
