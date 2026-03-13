const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'email', 'bio', 'location', 'skills',
      'education', 'experience'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update company details (for recruiters)
exports.updateCompanyDetails = async (req, res, next) => {
  try {
    const allowedFields = [
      'companyName', 'companyDescription', 'companyLogo',
      'companyWebsite', 'companyLocation', 'industry', 'foundedYear'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { companyDetails: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile photo
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhoto: req.file.path },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user.profilePhoto
    });
  } catch (error) {
    next(error);
  }
};

// Upload resume
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        resume: {
          url: req.file.path,
          publicId: req.file.filename
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user.resume
    });
  } catch (error) {
    next(error);
  }
};

// Save job
exports.saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (user.savedJobs.includes(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Job already saved'
      });
    }

    user.savedJobs.push(jobId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Job saved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Unsave job
exports.unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const user = await User.findById(req.user.id);
    
    user.savedJobs = user.savedJobs.filter(
      job => job.toString() !== jobId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get saved jobs
exports.getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedJobs',
      match: { status: 'approved' }
    });

    res.status(200).json({
      success: true,
      count: user.savedJobs.length,
      data: user.savedJobs
    });
  } catch (error) {
    next(error);
  }
};

// Get user's applications
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate({
        path: 'job',
        select: 'title companyName location salary jobType status'
      })
      .sort('-appliedAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// Get recommended jobs
exports.getRecommendedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get jobs matching user's skills
    const recommendedJobs = await Job.find({
      status: 'approved',
      skills: { $in: user.skills },
      _id: { $nin: user.savedJobs }
    })
      .populate('company', 'companyName companyLogo')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      count: recommendedJobs.length,
      data: recommendedJobs
    });
  } catch (error) {
    next(error);
  }
};

// Get public user profile
exports.getPublicProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      'name profilePhoto bio location skills education experience'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

