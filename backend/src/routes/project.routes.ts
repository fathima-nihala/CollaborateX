// src/routes/project.routes.ts
import { Router } from 'express';
import projectController from '../controllers/project.controller';
import { validateBody } from '../middleware/validation';
import { CreateProjectSchema, UpdateProjectSchema, AddProjectMemberSchema } from '../schemas/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

// Project CRUD
router.post('/', validateBody(CreateProjectSchema), projectController.createProject.bind(projectController));
router.get('/', projectController.getUserProjects.bind(projectController));
router.get('/:id', projectController.getProject.bind(projectController));
router.put('/:id', validateBody(UpdateProjectSchema), projectController.updateProject.bind(projectController));
router.delete('/:id', projectController.deleteProject.bind(projectController));

// Project membership
router.post('/:projectId/members', validateBody(AddProjectMemberSchema), projectController.addMember.bind(projectController));
router.delete('/:projectId/members/:memberId', projectController.removeMember.bind(projectController));

export default router;
