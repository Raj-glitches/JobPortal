const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const jobService = require('../services/jobService');

// Get all jobs (with filters)
exports.getJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      jobType,
      experience,
      salaryMin,
      salaryMax,
      skills,
      source = 'all',
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = { status: 'approved' };

    if (source !== 'all') {
      query.source = source === 'external' ? 'jsearch' : 'internal';
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (experience) {
      query.experience = experience;
    }

    // ✅ Fixed Salary Range Overlap Filter
    if (salaryMin || salaryMax) {
      const salaryConditions = [];
      if (salaryMin) {
        salaryConditions.push({ 'salary.max': { $gte: Number(salaryMin) } });
      }
      if (salaryMax) {
        salaryConditions.push({ 'salary.min': { $lte: Number(salaryMax) } });
      }
      if (salaryConditions.length > 0) {
        query.$and = query.$and ? [...query.$and, ...salaryConditions] : salaryConditions;
      }
    }

    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillArray };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let jobsQuery = Job.find(query).populate('company', 'companyName companyLogo companyDetails');

    // Text score sort for relevance
    if (search && sort === 'relevance') {
      jobsQuery.sort({ score: { $meta: 'textScore' } });
    } else {
      jobsQuery.sort(sort);
    }

    jobsQuery = jobsQuery.skip(skip).limit(parseInt(limit));

    const jobs = await jobsQuery.exec();
    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// Get single job
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'companyName companyLogo companyDetails email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment views
    job.views += 1;
    await job.save();

    // Check if user has applied
    let hasApplied = false;
    if (req.user) {
      const application = await Application.findOne({
        job: job._id,
        applicant: req.user.id
      });
      hasApplied = !!application;
    }

    res.status(200).json({
      success: true,
      data: job,
      hasApplied
    });
  } catch (error) {
    next(error);
  }
};

// Create new job (recruiter only)
exports.createJob = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.companyDetails || !user.companyDetails.companyName) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your company profile first'
      });
    }

    const jobData = {
      ...req.body,
      company: req.user.id,
      companyName: user.companyDetails.companyName,
      companyLogo: user.companyDetails.companyLogo
    };

    const job = await Job.create(jobData);

    // Create notification for admin
    await Notification.create({
      user: req.user.id,
      title: 'New Job Posted',
      message: `Your job "${job.title}" has been posted and is pending approval`,
      type: 'job'
    });

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// Update job (recruiter only)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const updates = { ...req.body };
    
    // If job was approved, set back to pending for re-approval
    if (job.status === 'approved' && Object.keys(updates).length > 0) {
      updates.status = 'pending';
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// Delete job (recruiter only)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    // Delete all applications for this job
    await Application.deleteMany({ job: job._id });

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get recruiter's jobs
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ company: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// Get job applicants (recruiter only)
exports.getJobApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applicants'
      });
    }

    const applications = await Application.find({ job: job._id })
      .populate('applicant', 'name email mobile profilePhoto resume skills education experience')
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

// Get featured jobs
exports.getFeaturedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'approved', featured: true })
      .populate('company', 'companyName companyLogo')
      .sort('-createdAt')
      .limit(6);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// Get recent jobs
exports.getRecentJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'approved' })
      .populate('company', 'companyName companyLogo')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// Fetch external jobs (admin/recruiter)
exports.fetchExternalJobs = async (req, res, next) => {
  try {
    const { force = 'false', limit = '20' } = req.query;
    const result = await jobService.fetchAndRefreshExternalJobs(force === 'true', parseInt(limit));
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// Get recommended jobs (for job seekers)
exports.getRecommendedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    const recommendedJobs = await Job.find({
      status: 'approved',
      skills: { $in: user.skills || [] },
      _id: { $nin: await Application.distinct('job', { applicant: req.user.id }) }
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

