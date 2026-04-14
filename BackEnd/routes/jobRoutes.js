const express = require('express');
const router = express.Router();

const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  fetchExternalJobs,
  getMyJobs,
  getJobApplicants,
  getFeaturedJobs,
  getRecentJobs,
  getRecommendedJobs
} = require('../controllers/jobController');

const { protect, optionalAuth, authorize } = require('../middleware/authMiddleware');


// ✅ Public routes
router.get('/featured', getFeaturedJobs);
router.get('/recent', getRecentJobs);
router.get('/', optionalAuth, getJobs);
router.get('/search', optionalAuth, getJobs);
router.get('/:id', optionalAuth, getJob);


// ✅ Job Seeker routes
router.get('/user/recommended', protect, getRecommendedJobs);


// ✅ External API fetch
router.post('/fetch', protect, authorize('recruiter', 'admin'), fetchExternalJobs);


// ✅ Recruiter routes
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

router.get('/recruiter/my-jobs', protect, authorize('recruiter', 'admin'), getMyJobs);
router.get('/recruiter/:jobId/applicants', protect, authorize('recruiter', 'admin'), getJobApplicants);


module.exports = router;