// src/schemas/validation.ts
import { z } from 'zod';
import { UserRole, TaskStatus, TaskPriority, ProjectStatus } from '../types';

// Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Project Schemas
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.nativeEnum(ProjectStatus))
    .optional(),
});

export const AddProjectMemberSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  role: z.nativeEnum(UserRole).optional(),
});

// Task Schemas
export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(2000).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assignedToId: z.string().cuid().optional(),
  dueDate: z.string().datetime().optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assignedToId: z.string().cuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number()).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number()).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Filter Schemas
export const TaskFilterSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assignedToId: z.string().cuid().optional(),
  createdById: z.string().cuid().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type PaginationParams = z.infer<typeof PaginationSchema>;
export type TaskFilters = z.infer<typeof TaskFilterSchema>;
