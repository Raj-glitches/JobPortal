const express = require('express');
const router = express.Router();
const { 
  sendOTP, 
  verifyOTP, 
  register, 
  login, 
  loginWithPassword,
  googleAuth, 
  forgotPassword, 
  resetPassword,
  getMe,
  updatePassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', register);
router.post('/login', login);
router.post('/login-password', loginWithPassword);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;

