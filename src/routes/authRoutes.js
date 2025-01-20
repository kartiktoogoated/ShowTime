const express = require('express');
const { signUp, logIn, promoteToAdmin } = require('../controllers/authController');

const router = express.Router();

// Route definitions
router.post('/register', signUp);
router.post('/login', logIn);
router.post('/promote', promoteToAdmin);

module.exports = router;
