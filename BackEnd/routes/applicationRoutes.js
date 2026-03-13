const express = require('express');
const router = express.Router();
const { 
  applyForJob,
  getMyApplications,
  getMyApplicationStatus,
  getJobApplicants,
  updateApplicationStatus,
  scheduleInterview,
  withdrawApplication,
  getAllMyApplications
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Job seeker routes
router.post('/job/:jobId', protect, authorize('jobseeker'), applyForJob);
router.get('/my', protect, authorize('jobseeker'), getMyApplications);
router.get('/job/:jobId/status', protect, authorize('jobseeker'), getMyApplicationStatus);
router.delete('/:applicationId', protect, authorize('jobseeker'), withdrawApplication);

// Recruiter routes
router.get('/recruiter/all', protect, authorize('recruiter', 'admin'), getAllMyApplications);
router.get('/job/:jobId/applicants', protect, authorize('recruiter', 'admin'), getJobApplicants);
router.put('/:applicationId/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.post('/:applicationId/interview', protect, authorize('recruiter', 'admin'), scheduleInterview);

module.exports = router;

