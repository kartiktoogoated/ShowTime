import { Router } from 'express';
import { signUp, logIn, promoteToAdmin, googleAuth, googleAuthCallback } from '../controllers/authController';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Local authentication endpoints
router.post('/register', signUp);
router.post('/login', logIn);
router.post('/promote', authenticate, authorizeAdmin, promoteToAdmin);

// Google OAuth endpoints
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

export default router;
