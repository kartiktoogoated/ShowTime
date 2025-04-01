import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const signUp = async (req:Request, res:Response): Promise<void> => {
  try{
    const { name, email, password} = req.body;

    //Checking duplications
    const existingUser = await prisma.user.findUnique( {where : {email}});
    if(existingUser) {
      res.status(500).json({ message: 'User already exists'});
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data : {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email},
    });
  } catch (error:any){
    res.status(400).json({ message: error.message});
  }
}

export const logIn = async (req:Request, res:Response): Promise<void> => {
  try{
    const {email, password} = req.body;
    const user = await prisma.user.findUnique( {where: email});
    if(!user){
      res.status(404).json({message: 'User not found'});
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      res.status(401).json({message: 'Invalid credentials'});
      return;
    }

    const token = jwt.sign(
      {id: user.id, role: user.role},
      process.env.JWT_SECRET as string,
      {expiresIn: '1d'}
    );

    res.status(200).json({
      message: 'Login successfully',
      token,
      user: {id: user.id, name: user.name, email: user.email},
    });
  } catch (error: any){
    res.status(500).json({ message: error.message })
  }
};

export const promoteToAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const userToPromote = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToPromote) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (userToPromote.role.toLowerCase() === 'admin') {
      res.status(400).json({ message: 'User is already an admin' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });

    res.status(200).json({ message: 'User promoted to admin', user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/* -------------------------------
      GOOGLE OAUTH ENDPOINTS
--------------------------------- */

// Initiates Google OAuth flow
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// Handles Google OAuth callback and redirects to the frontend with a token
export const googleAuthCallback = [
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req: Request, res: Response) => {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: 'User authentication failed' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    // Redirect to your frontend with the token (adjust the URL as needed)
    res.redirect(`http://localhost:5173?token=${token}`);
  },
];
