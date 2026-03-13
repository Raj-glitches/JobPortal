const express = require('express');
const router = express.Router();
const { 
  getAllUsers,
  getUser,
  blockUser,
  unblockUser,
  deleteUser,
  getAllJobs,
  approveJob,
  rejectJob,
  toggleFeaturedJob,
  deleteJob,
  getAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.delete('/users/:id', deleteUser);

// Job management
router.get('/jobs', getAllJobs);
router.put('/jobs/:id/approve', approveJob);
router.put('/jobs/:id/reject', rejectJob);
router.put('/jobs/:id/featured', toggleFeaturedJob);
router.delete('/jobs/:id', deleteJob);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;

