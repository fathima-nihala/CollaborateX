import { Request, Response } from 'express';
import taskService from '../services/task.service';
import type { CreateTaskInput, UpdateTaskInput } from '../schemas/validation';
import { PaginationSchema } from '../schemas/validation';
import type { ApiResponse } from '../types';

export const createTask = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
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
};

export const getTask = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { taskId } = req.params;
  const task = await taskService.getTaskById(taskId, req.user.id);

  const response: ApiResponse = {
    success: true,
    message: 'Task retrieved successfully',
    data: task,
  };

  res.status(200).json(response);
};

export const getProjectTasks = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { projectId } = req.params;
  // Parse and coerce page/limit from query strings to numbers
  const pagination = PaginationSchema.parse(req.query);

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
};

export const updateTask = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
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
};

export const deleteTask = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { taskId } = req.params;
  await taskService.deleteTask(taskId, req.user.id);

  const response: ApiResponse = {
    success: true,
    message: 'Task deleted successfully',
  };

  res.status(200).json(response);
};
