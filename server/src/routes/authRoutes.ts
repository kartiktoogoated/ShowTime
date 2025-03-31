import { Router } from 'express';
import { signUp, logIn, promoteToAdmin, googleAuth, googleAuthCallback } from '../controllers/authController';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware';

const authRouter = Router();

// Local authentication endpoints
authRouter.post('/register', signUp);
authRouter.post('/login', logIn);
authRouter.post('/promote', authenticate, authorizeAdmin, promoteToAdmin);

// Google OAuth endpoints
authRouter.get('/google', googleAuth);
authRouter.get('/google/callback', googleAuthCallback);

export default authRouter;
