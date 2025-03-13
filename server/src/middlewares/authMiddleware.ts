import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
    console.log('Decoded token:', decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Augment request with user information
    (req as any).user = user;
    next();
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!(req as any).user || ((req as any).user.role as string).toLowerCase() !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }
    next();
  } catch (error: any) {
    console.error('Authorization error:', error.message);
    res.status(500).json({ message: 'Error verifying admin status' });
  }
};

export const promoteToAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const userToPromote = await User.findById(userId);

    if (!userToPromote) {
      res.status(404).json({ message: 'User to promote not found' });
      return;
    }

    if (userToPromote.role.toLowerCase() === 'admin') {
      res.status(400).json({ message: 'User is already an admin' });
      return;
    }

    userToPromote.role = 'ADMIN';
    await userToPromote.save();

    res.status(200).json({ message: 'User successfully promoted to admin', user: userToPromote });
  } catch (error: any) {
    console.error('Error promoting user to admin:', error.message);
    res.status(500).json({ message: 'Error promoting user to admin' });
  }
};
