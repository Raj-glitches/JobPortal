const express = require('express');
const router = express.Router();
const { 
  getJobs, 
  getJob, 
  createJob, 
  updateJob, 
  deleteJob,
  getMyJobs,
  getJobApplicants,
  getFeaturedJobs,
  getRecentJobs,
  getRecommendedJobs
} = require('../controllers/jobController');
const { protect, optionalAuth, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/featured', getFeaturedJobs);
router.get('/recent', getRecentJobs);
router.get('/', optionalAuth, getJobs);
router.get('/:id', optionalAuth, getJob);

// Protected routes - Job Seekers
router.get('/user/recommended', protect, getRecommendedJobs);

// Protected routes - Recruiters
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);
router.get('/recruiter/my-jobs', protect, authorize('recruiter', 'admin'), getMyJobs);
router.get('/recruiter/:jobId/applicants', protect, authorize('recruiter', 'admin'), getJobApplicants);

module.exports = router;

