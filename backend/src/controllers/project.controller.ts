// src/controllers/project.controller.ts
import { Request, Response, NextFunction } from 'express';
import projectService from '../services/project.service';
import { CreateProjectInput, UpdateProjectInput, AddProjectMemberSchema, PaginationParams } from '../schemas/validation';
import { ApiResponse } from '../types';

export class ProjectController {
  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { name, description } = req.body as CreateProjectInput;
      const project = await projectService.createProject(name, description, req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Project created successfully',
        data: project,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { id } = req.params;
      const project = await projectService.getProjectById(id, req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Project retrieved successfully',
        data: project,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUserProjects(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const pagination = req.query as unknown as PaginationParams;
      const result = await projectService.getProjectsByUser(req.user.id, pagination);

      const response: ApiResponse = {
        success: true,
        message: 'Projects retrieved successfully',
        data: result.data,
        ...{pageInfo: result.pageInfo},
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { id } = req.params;
      const data = req.body as UpdateProjectInput;
      const project = await projectService.updateProject(id, req.user.id, data);

      const response: ApiResponse = {
        success: true,
        message: 'Project updated successfully',
        data: project,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { id } = req.params;
      await projectService.deleteProject(id, req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Project deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { projectId } = req.params;
      const validated = AddProjectMemberSchema.parse(req.body);
      const member = await projectService.addProjectMember(
        projectId,
        req.user.id,
        validated.userId,
        validated.role
      );

      const response: ApiResponse = {
        success: true,
        message: 'Member added successfully',
        data: member,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { projectId, memberId } = req.params;
      await projectService.removeProjectMember(projectId, req.user.id, memberId);

      const response: ApiResponse = {
        success: true,
        message: 'Member removed successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProjectController();
