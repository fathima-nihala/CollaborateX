// src/controllers/project.controller.ts
import { Request, Response } from 'express';
import projectService from '../services/project.service';
import type { CreateProjectInput, UpdateProjectInput, PaginationParams } from '../schemas/validation';
import { AddProjectMemberSchema } from '../schemas/validation';
import type { ApiResponse } from '../types';

export const createProject = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { name, description } = req.body as CreateProjectInput;
  const project = await projectService.createProject(name, description, req.user.id);

  const response: ApiResponse = {
    success: true,
    message: 'Project created successfully',
    data: project,
  };

  res.status(201).json(response);
};

export const getProject = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { id } = req.params;
  const project = await projectService.getProjectById(id, req.user.id);

  const response: ApiResponse = {
    success: true,
    message: 'Project retrieved successfully',
    data: project,
  };

  res.status(200).json(response);
};

export const getUserProjects = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const pagination = req.query as unknown as PaginationParams;
  const result = await projectService.getProjectsByUser(req.user.id, pagination);

  const response: ApiResponse = {
    success: true,
    message: 'Projects retrieved successfully',
    data: result.data,
    ...{ pageInfo: result.pageInfo },
  };

  res.status(200).json(response);
};

export const updateProject = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
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
};

export const deleteProject = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { id } = req.params;
  await projectService.deleteProject(id, req.user.id);

  const response: ApiResponse = {
    success: true,
    message: 'Project deleted successfully',
  };

  res.status(200).json(response);
};

export const addMember = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
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
};

export const removeMember = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { projectId, memberId } = req.params;
  await projectService.removeProjectMember(projectId, req.user.id, memberId);

  const response: ApiResponse = {
    success: true,
    message: 'Member removed successfully',
  };

  res.status(200).json(response);
};
