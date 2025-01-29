const express = require('express');
const { signUp, logIn, promoteToAdmin } = require('../controllers/authController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware'); 

const router = express.Router();

router.post('/register', signUp);
router.post('/login', logIn);
router.post('/promote', authenticate, authorizeAdmin, promoteToAdmin);

module.exports = router;
