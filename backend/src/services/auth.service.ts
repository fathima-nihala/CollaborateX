// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import { AuthenticationError, ConflictError } from '../utils/errors';
import { AuthTokens, UserWithoutPassword } from '../types';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET!;
  private readonly jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
  private readonly jwtExpiry = process.env.JWT_EXPIRY || '15m';
  private readonly jwtRefreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  private readonly bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

  async register(
    email: string,
    username: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<UserWithoutPassword> {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const duplicateField = existingUser.email === email ? 'email' : 'username';
      throw new ConflictError(`User with this ${duplicateField} already exists`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.bcryptRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    logger.info('User registered successfully', { userId: user.id, email });

    return this.formatUserResponse(user);
  }

  async login(email: string, password: string): Promise<{ user: UserWithoutPassword; tokens: AuthTokens }> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Failed login attempt', { email });
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    logger.info('User logged in successfully', { userId: user.id });

    return {
      user: this.formatUserResponse(user),
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as any;

      // Check if refresh token exists in DB
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new AuthenticationError('Refresh token expired or invalid');
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Generate new tokens
      const newTokens = this.generateTokens(user);

      // Delete old refresh token and create new one
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: newTokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      logger.info('Token refreshed successfully', { userId: user.id });

      return newTokens;
    } catch (error) {
      logger.warn('Token refresh failed', { error: (error as Error).message });
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    logger.info('User logged out successfully', { userId });
  }

  private generateTokens(user: User): AuthTokens {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiry,
    });

    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiry,
    });

    return { accessToken, refreshToken };
  }

  private formatUserResponse(user: User): UserWithoutPassword {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as UserWithoutPassword;
  }
}

export default new AuthService();
