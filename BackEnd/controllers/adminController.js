const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Get all users (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, isBlocked } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Get single user (admin)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

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

// Block user (admin)
exports.blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot block an admin'
      });
    }

    user.isBlocked = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Unblock user (admin)
exports.unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBlocked = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an admin'
      });
    }

    // Delete related data
    if (user.role === 'recruiter') {
      await Job.deleteMany({ company: user._id });
    }
    
    await Application.deleteMany({ applicant: user._id });

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all jobs (admin)
exports.getAllJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search, featured } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .populate('company', 'name email companyDetails')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

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

// Approve job (admin)
exports.approveJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    job.status = 'approved';
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job approved successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// Reject job (admin)
exports.rejectJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    job.status = 'rejected';
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job rejected',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// Toggle featured job (admin)
exports.toggleFeaturedJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    job.featured = !job.featured;
    await job.save();

    res.status(200).json({
      success: true,
      message: job.featured ? 'Job marked as featured' : 'Job removed from featured',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// Delete job (admin)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Delete all applications
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

// Get analytics (admin)
exports.getAnalytics = async (req, res, next) => {
  try {
    // User counts
    const totalUsers = await User.countDocuments();
    const jobSeekers = await User.countDocuments({ role: 'jobseeker' });
    const recruiters = await User.countDocuments({ role: 'recruiter' });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    // Job counts
    const totalJobs = await Job.countDocuments();
    const approvedJobs = await Job.countDocuments({ status: 'approved' });
    const pendingJobs = await Job.countDocuments({ status: 'pending' });
    const rejectedJobs = await Job.countDocuments({ status: 'rejected' });

    // Application counts
    const totalApplications = await Application.countDocuments();

    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Jobs by type
    const jobsByType = await Job.aggregate([
      { $group: { _id: '$jobType', count: { $sum: 1 } } }
    ]);

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Recent jobs (last 7 days)
    const recentJobs = await Job.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Top companies by job posts
    const topCompanies = await Job.aggregate([
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $project: {
          companyName: '$company.companyDetails.companyName',
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          jobSeekers,
          recruiters,
          blocked: blockedUsers,
          recentRegistrations
        },
        jobs: {
          total: totalJobs,
          approved: approvedJobs,
          pending: pendingJobs,
          rejected: rejectedJobs,
          recentJobs,
          byType: jobsByType
        },
        applications: {
          total: totalApplications,
          byStatus: applicationsByStatus
        },
        topCompanies
      }
    });
  } catch (error) {
    next(error);
  }
};

