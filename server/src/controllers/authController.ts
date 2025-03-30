// authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User';

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser._id, name, email },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const logIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    // Return both token and user info
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const promoteToAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.role = 'ADMIN';
    await user.save();

    res.status(200).json({ message: 'User promoted to admin' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/* -------------------------------
      GOOGLE OAUTH ENDPOINTS
--------------------------------- */

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleAuthCallback = [
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req: Request, res: Response) => {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: 'User authentication failed' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    // Redirect to frontend (adjust URL if needed)
    res.redirect(`http://localhost:5173?token=${token}`);
  },
];
