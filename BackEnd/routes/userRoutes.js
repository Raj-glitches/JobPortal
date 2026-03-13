const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  updateCompanyDetails,
  uploadProfilePhoto,
  uploadResume,
  saveJob,
  unsaveJob,
  getSavedJobs,
  getMyApplications,
  getRecommendedJobs,
  getPublicProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/company-details', updateCompanyDetails);
router.post('/upload-photo', uploadProfilePhoto);
router.post('/upload-resume', uploadResume);
router.post('/save-job/:jobId', saveJob);
router.delete('/save-job/:jobId', unsaveJob);
router.get('/saved-jobs', getSavedJobs);
router.get('/applications', getMyApplications);
router.get('/recommended-jobs', getRecommendedJobs);

// Public route
router.get('/public/:userId', getPublicProfile);

module.exports = router;

