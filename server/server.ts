import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';

// <-- ADDED
import session from 'express-session';
import passport from 'passport'; // We need this to call passport.session()

import authRoutes from './src/routes/authRoutes';
import movieRoutes from './src/routes/movieRoutes';
import reservationRoutes from './src/routes/reservationRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware setup
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet({ contentSecurityPolicy: false }));

// <-- ADDED: configure express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'some_fallback_secret',
    resave: false,
    saveUninitialized: false,
  })
);

// <-- ADDED: initialize Passport session support
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MongoDB URI is not defined in environment variables.');
    }
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error: any) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Route setup
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reservations', reservationRoutes);

// Catch-all route for 404 errors
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    console.log('Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error: any) {
    console.error('Error during shutdown:', error.message);
    process.exit(1);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
