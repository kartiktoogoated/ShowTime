import { Router } from 'express';
import { signUp, logIn, promoteToAdmin } from '../controllers/authController';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', signUp);
router.post('/login', logIn);
router.post('/promote', authenticate, authorizeAdmin, promoteToAdmin);

export default router;
