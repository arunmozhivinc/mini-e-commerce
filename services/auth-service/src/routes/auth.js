const express = require('express');
const router = express.Router();
const { register, login, getMe, getAllUsers } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', authenticate, getMe);

// Admin routes
router.get('/users', authenticate, authorize('admin'), getAllUsers);

module.exports = router;
