const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  checkUsernameAvailability
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/username/:username', checkUsernameAvailability);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;

