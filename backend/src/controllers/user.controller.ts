import { Request, Response } from 'express';
import authService from '../services/auth.service';
import logger from '../utils/logger';

export const searchUsers = async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await authService.findUsers(query);

    res.status(200).json({
        status: 'success',
        data: users,
    });
};
