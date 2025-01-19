const express = require('express');
const { signUp, logIn, promoteToAdmin } = require('../controllers/authController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', logIn);
router.post('/promote', authenticate, authorize(['ADMIN']), promoteToAdmin);

module.exports = router;
