import { PrismaClient } from '@prisma/client';
import { NotFoundError, AuthorizationError, ConflictError } from '../utils/errors';
import { PaginationParams, UserRole } from '../types';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class ProjectService {
  async createProject(name: string, description: string | undefined, userId: string) {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId,
            role: UserRole.ADMIN,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    logger.info('Project created', { projectId: project.id, userId });
    return project;
  }

  async getProjectById(id: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project');
    }

    // Check if user is member of project
    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new AuthorizationError();
    }

    return project;
  }

  async getProjectsByUser(
    userId: string,
    { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' }: PaginationParams
  ) {
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
        include: {
          members: {
            select: {
              userId: true,
              role: true,
            },
          },
          tasks: {
            select: {
              id: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.project.count({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
      }),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data: projects,
      pageInfo: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  async updateProject(id: string, userId: string, data: { name?: string; description?: string; status?: string }) {
    const project = await this.getProjectById(id, userId);

    // Check if user is admin of project
    const userMembership = project.members.find((m) => m.userId === userId);
    if (userMembership?.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Only project admin can update project');
    }

    const updated = await prisma.project.update({
      where: { id },
      data,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });

    logger.info('Project updated', { projectId: id, userId });
    return updated;
  }

  async deleteProject(id: string, userId: string) {
    const project = await this.getProjectById(id, userId);

    // Check if user is admin of project
    const userMembership = project.members.find((m) => m.userId === userId);
    if (userMembership?.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Only project admin can delete project');
    }

    await prisma.project.delete({
      where: { id },
    });

    logger.info('Project deleted', { projectId: id, userId });
  }

  async addProjectMember(projectId: string, userId: string, newMemberId: string, role: UserRole = UserRole.USER) {
    const project = await this.getProjectById(projectId, userId);

    // Check if user is admin
    const userMembership = project.members.find((m) => m.userId === userId);
    if (userMembership?.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Only project admin can add members');
    }

    // Check if member already exists
    const existingMember = project.members.find((m) => m.userId === newMemberId);
    if (existingMember) {
      throw new ConflictError('User is already a member of this project');
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: newMemberId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info('Project member added', { projectId, userId: newMemberId });
    return member;
  }

  async removeProjectMember(projectId: string, userId: string, memberId: string) {
    const project = await this.getProjectById(projectId, userId);

    // Check if user is admin
    const userMembership = project.members.find((m) => m.userId === userId);
    if (userMembership?.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Only project admin can remove members');
    }

    // Cannot remove the last admin
    const adminCount = project.members.filter((m) => m.role === UserRole.ADMIN).length;
    const memberToRemove = project.members.find((m) => m.userId === memberId);
    if (adminCount === 1 && memberToRemove?.role === UserRole.ADMIN) {
      throw new ConflictError('Cannot remove the last admin from the project');
    }

    await prisma.projectMember.deleteMany({
      where: {
        projectId,
        userId: memberId,
      },
    });

    logger.info('Project member removed', { projectId, memberId, removedBy: userId });
  }
}

export default new ProjectService();
