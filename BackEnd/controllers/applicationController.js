const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Apply for a job
exports.applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const applicant = req.user.id;

    const { coverLetter } = req.body;
    let resumeData = {};

    // Handle uploaded resume
    if (req.file) {
      resumeData = {
        url: req.file.path,
        publicId: req.file.filename
      };
    } else {
      // Get existing user resume
      const user = await User.findById(applicant);
      if (user && user.resume) {
        resumeData = user.resume;
      }
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }


    if (job.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This job is not currently accepting applications'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: applicant,
      coverLetter,
      resume: resumeData
    });

    // Update job applicants
    job.applicants.push(application._id);
    await job.save();

    const user = await User.findById(applicant);
    // Create notification for recruiter
    await Notification.create({
      user: job.company,
      title: 'New Application',
      message: `New application for ${job.title} from ${user.name}`,
      type: 'application',
      link: `/recruiter/applications/${job._id}`
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// Get my applications (job seeker)
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate({
        path: 'job',
        match: { status: 'approved' },
        select: 'title companyName location salary jobType experience skills'
      })
      .sort('-appliedAt');

    // Filter out applications where job was not found (deleted or rejected)
    const validApplications = applications.filter(app => app.job);

    res.status(200).json({
      success: true,
      count: validApplications.length,
      data: validApplications
    });
  } catch (error) {
    next(error);
  }
};

// Get applicant's application status
exports.getMyApplicationStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const application = await Application.findOne({
      job: jobId,
      applicant: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// Get job applicants (recruiter)
exports.getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

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

    const applications = await Application.find({ job: jobId })
      .populate('applicant', 'name email mobile profilePhoto resume skills education experience location')
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

// Update application status (recruiter)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status, notes, scheduledInterview } = req.body;

    const application = await Application.findById(applicationId)
      .populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership
    if (application.job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    application.status = status;
    if (notes) application.notes = notes;
    if (scheduledInterview) {
      application.scheduledInterview = scheduledInterview;
    }

    await application.save();

    // Create notification for applicant
    const statusMessages = {
      viewed: 'Your application has been viewed',
      shortlisted: 'Congratulations! You have been shortlisted',
      rejected: 'Your application has been not selected',
      hired: 'Congratulations! You have been hired'
    };

    await Notification.create({
      user: application.applicant,
      title: 'Application Update',
      message: statusMessages[status] || `Your application status has been updated to ${status}`,
      type: 'application',
      link: `/dashboard/applications/${application._id}`
    });

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// Schedule interview (recruiter)
exports.scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { date, time, meetingLink } = req.body;

    const application = await Application.findById(applicationId)
      .populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership
    if (application.job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to schedule interview'
      });
    }

    application.scheduledInterview = {
      date,
      time,
      meetingLink,
      status: 'scheduled'
    };
    application.status = 'shortlisted';

    await application.save();

    // Create notification for applicant
    await Notification.create({
      user: application.applicant,
      title: 'Interview Scheduled',
      message: `Interview scheduled for ${application.job.title} on ${new Date(date).toLocaleDateString()} at ${time}`,
      type: 'interview',
      link: `/dashboard/applications/${application._id}`
    });

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw application (job seeker)
exports.withdrawApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    // Update job applicants
    const job = await Job.findById(application.job);
    if (job) {
      job.applicants = job.applicants.filter(
        app => app.toString() !== application._id.toString()
      );
      await job.save();
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all applications for recruiter
exports.getAllMyApplications = async (req, res, next) => {
  try {
    // Get all jobs posted by recruiter
    const jobs = await Job.find({ company: req.user.id });
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('applicant', 'name email profilePhoto resume')
      .populate('job', 'title companyName')
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

