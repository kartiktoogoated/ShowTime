import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

/* ---------------------------------
   1) LOCAL SIGNUP / LOGIN ENDPOINTS
----------------------------------- */

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Request body:', req.body);
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log('New user created:', newUser);
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser._id, name, email },
    });
  } catch (error: any) {
    console.error('Sign-up error:', error.message);
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

    res.status(200).json({ message: 'Login successful', token });
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

/* ---------------------------------
   2) GOOGLE OAUTH SETUP & ENDPOINTS
----------------------------------- */

// Configure Passport with Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user email from the Google profile
        const email = profile.emails && profile.emails[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'));
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (!user) {
          // Create a new user
          user = await User.create({
            name: profile.displayName,
            email,
            password: 'google_oauth_no_password', // or a random string
          });
        }

        // Passport attaches the user to req.user
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// "GET /auth/google" - Redirect user to Google's OAuth 2.0 consent screen
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// "GET /auth/google/callback" - Handle Google's response
export const googleAuthCallback = [
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req: Request, res: Response) => {
    try {
      // req.user is set by the GoogleStrategy callback
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ message: 'User authentication failed' });
      }

      // Create a JWT for the user
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
      );

      // Option: Redirect to your frontend with the token as a query parameter
      return res.redirect(`http://localhost:3000?token=${token}`);
    } catch (error: any) {
      console.error('Google callback error:', error.message);
      res.status(500).json({ message: error.message });
    }
  },
];
