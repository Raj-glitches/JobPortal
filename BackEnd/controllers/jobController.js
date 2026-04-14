const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');\nconst Notification = require('../models/Notification');\nconst jobService = require('../services/jobService');

// Get all jobs (with filters)
exports.getJobs = async (req, res, next) => {
  try {
  const {\n    page = 1,\n    limit = 10,\n    search,\n    location,\n    jobType,\n    experience,\n    salaryMin,\n    salaryMax,\n    skills,\n    source = 'all',\n    sort = '-createdAt'\n  } = req.query;\n\n  // Build query\n  let query = { status: 'approved' };\n\n  if (source !== 'all') {\n    query.source = source === 'external' ? 'jsearch' : 'internal';\n  }

    // Build query
    const query = { status: 'approved' };

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

    if (salaryMin || salaryMax) {
      query['salary.min'] = { $gte: salaryMin || 0 };
      query['salary.max'] = { $lte: salaryMax || Number.MAX_VALUE };
    }

    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillArray };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let jobsQuery = Job.find(query).populate('company', 'companyName companyLogo companyDetails');\n\n    // Text score sort for relevance\n    if (search && sort === 'relevance') {\n      jobsQuery = Job.aggregate([\n        { $match: query },\n        { $addFields: { score: { $meta: 'textScore' } } },\n        { $sort: { score: { $meta: 'textScore' } } },\n        { $skip: skip },\n        { $limit: parseInt(limit) },\n        { $lookup: { from: 'users', localField: 'company', foreignField: '_id', as: 'company' } },\n        { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },\n        { $project: { company: { companyName: 1, companyLogo: 1, companyDetails: 1 } } }\n      ]);\n      const jobs = await jobsQuery;\n      const total = await Job.countDocuments(query);\n    } else {\n      jobsQuery = jobsQuery.sort(sort).skip(skip).limit(parseInt(limit));\n      const jobs = await jobsQuery;\n      const total = await Job.countDocuments(query);\n    }

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

// Fetch external jobs (admin/recruiter)\nexports.fetchExternalJobs = async (req, res, next) => {\n  try {\n    const { force = 'false', limit = '20' } = req.query;\n    const result = await jobService.fetchAndRefreshExternalJobs(force === 'true', parseInt(limit));\n    res.status(200).json({\n      success: true,\n      ...result\n    });\n  } catch (error) {\n    next(error);\n  }\n};\n\n// Get recommended jobs (for job seekers)\nexports.getRecommendedJobs = async (req, res, next) => {\n  try {\n    const user = await User.findById(req.user.id);\n    \n    const recommendedJobs = await Job.find({\n      status: 'approved',\n      skills: { $in: user.skills },\n      _id: { $nin: await Application.distinct('job', { applicant: req.user.id }) }\n    })\n      .populate('company', 'companyName companyLogo')\n      .sort('-createdAt')\n      .limit(10);\n\n    res.status(200).json({\n      success: true,\n      count: recommendedJobs.length,\n      data: recommendedJobs\n    });\n  } catch (error) {\n    next(error);\n  }\n};\n

