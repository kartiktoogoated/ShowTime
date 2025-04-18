import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import helmet from 'helmet';
import session from 'express-session';
import passport from './src/config/passportConfig';
import cors from 'cors';

import authRoutes from './src/routes/authRoutes';
import movieRoutes from './src/routes/movieRoutes';
import reservationRoutes from './src/routes/reservationRoutes';
import moodRoutes from "./src/routes/moodRoutes";
import moodRouter from './src/routes/moodRoutes';

const app = express();
const PORT = process.env.PORT || 8080;

// ─────────────────────────────────────────────────────────────────────────────
// 1. CORE MIDDLEWARE SETUP
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(morgan('dev'));

// Use Helmet with modified crossOriginResourcePolicy to allow images from other origins
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Serve static files from the "uploads" folder located outside the server folder
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'))
);

// Apply CORS to allow requests from your frontend (adjust origin as needed)
app.use(
  cors({
    origin: [
      "https://your-vercel-app.vercel.app", // Replace with your actual Vercel frontend URL
      "http://localhost:5173" // Keep localhost for development
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies/session
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. SESSION & PASSPORT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'some_fallback_secret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ─────────────────────────────────────────────────────────────────────────────
// 3. MONGODB CONNECTION
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// 4. ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/mood', moodRoutes)

// 404 catch-all route
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. START SERVER
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
