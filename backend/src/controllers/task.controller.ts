// src/controllers/task.controller.ts
import { Request, Response, NextFunction } from 'express';
import taskService from '../services/task.service';
import { CreateTaskInput, UpdateTaskInput, PaginationParams, TaskFilterSchema } from '../schemas/validation';
import { ApiResponse } from '../types';

export class TaskController {
  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { projectId } = req.params;
      const data = req.body as CreateTaskInput;
      const task = await taskService.createTask(projectId, req.user.id, data);

      const response: ApiResponse = {
        success: true,
        message: 'Task created successfully',
        data: task,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { taskId } = req.params;
      const task = await taskService.getTaskById(taskId, req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Task retrieved successfully',
        data: task,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getProjectTasks(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { projectId } = req.params;
      const pagination = req.query as unknown as PaginationParams;
      
      // Extract filter parameters
      const filters = {
        status: (req.query.status as any) || undefined,
        priority: (req.query.priority as any) || undefined,
        assignedToId: (req.query.assignedToId as string) || undefined,
      };

      const result = await taskService.getProjectTasks(projectId, req.user.id, pagination, filters);

      const response: ApiResponse = {
        success: true,
        message: 'Tasks retrieved successfully',
        data: result.data,
        ...{ pageInfo: result.pageInfo },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { taskId } = req.params;
      const data = req.body as UpdateTaskInput;
      const task = await taskService.updateTask(taskId, req.user.id, data);

      const response: ApiResponse = {
        success: true,
        message: 'Task updated successfully',
        data: task,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { taskId } = req.params;
      await taskService.deleteTask(taskId, req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Task deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();
