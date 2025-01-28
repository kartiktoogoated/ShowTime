const express = require('express');
const { signUp, logIn, promoteToAdmin } = require('../controllers/authController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware'); // Import middlewares

const router = express.Router();

// Public routes
router.post('/register', signUp);
router.post('/login', logIn);

// Protected route: Only accessible by authenticated admins
router.post('/promote', authenticate, authorizeAdmin, promoteToAdmin);

module.exports = router;
