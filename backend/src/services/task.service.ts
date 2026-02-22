import { PrismaClient, TaskStatus } from '@prisma/client';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { PaginationParams, TaskPriority } from '../types';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class TaskService {
  async createTask(
    projectId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      priority?: TaskPriority;
      assignedToId?: string;
      dueDate?: string;
    }
  ) {
    // Verify user is member of project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });

    if (!projectMember || projectMember.role !== 'ADMIN') {
      throw new AuthorizationError('Only project admins can create tasks');
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || TaskPriority.MEDIUM,
        projectId,
        createdById: userId,
        assignedToId: data.assignedToId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    logger.info('Task created', { taskId: task.id, projectId, userId });
    return task;
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('Task');
    }

    // Verify user is member of project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: task.projectId,
        userId,
      },
    });

    if (!projectMember) {
      throw new AuthorizationError('You do not have access to this task');
    }

    // If not admin, verify task is assigned to this user
    if (projectMember.role !== 'ADMIN' && task.assignedToId !== userId) {
      throw new AuthorizationError('You can only access tasks assigned to you');
    }

    return task;
  }

  async getProjectTasks(
    projectId: string,
    userId: string,
    {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    }: PaginationParams,
    filters?: {
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedToId?: string;
    }
  ) {
    // Verify user is member of project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });

    if (!projectMember) {
      throw new AuthorizationError('You are not a member of this project');
    }

    const isAdmin = projectMember.role === 'ADMIN';

    const skip = (page - 1) * limit;

    const whereClause: any = {
      projectId,
    };

    // If not admin, only show tasks assigned to the user
    if (!isAdmin) {
      whereClause.assignedToId = userId;
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }
    if (filters?.priority) {
      whereClause.priority = filters.priority;
    }
    if (filters?.assignedToId) {
      whereClause.assignedToId = filters.assignedToId;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: whereClause,
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.task.count({ where: whereClause }),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data: tasks,
      pageInfo: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  async updateTask(
    taskId: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedToId?: string | null;
      dueDate?: string | null;
    }
  ) {
    const task = await this.getTaskById(taskId, userId);

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    logger.info('Task updated', { taskId, userId });
    return updated;
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await this.getTaskById(taskId, userId);

    // Only creator or project admin can delete
    if (task.createdById !== userId) {
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          projectId: task.projectId,
          userId,
        },
      });

      if (projectMember?.role !== 'ADMIN') {
        throw new AuthorizationError('Only task creator or project admin can delete this task');
      }
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    logger.info('Task deleted', { taskId, userId });
  }
}

export default new TaskService();
