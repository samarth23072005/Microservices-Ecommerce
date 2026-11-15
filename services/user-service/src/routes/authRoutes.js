const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const {
  registerValidation,
  loginValidation
} = require('../middlewares/validateRequest');

// Registration route: POST /api/users/register
router.post('/register', registerValidation, register);

// Login route: POST /api/users/login
router.post('/login', loginValidation, login);

module.exports = router;
