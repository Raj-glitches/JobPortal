const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide job title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },

  description: {
    type: String,
    required: [true, 'Please provide job description']
  },

  requirements: [{ type: String }],
  responsibilities: [{ type: String }],

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  companyName: {
    type: String,
    required: [true, 'Please provide company name']
  },

  companyLogo: String,

  location: {
    type: String,
    required: [true, 'Please provide job location']
  },

  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },

  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
    required: true
  },

  experience: {
    type: String,
    enum: ['fresher', '0-1', '1-3', '3-5', '5-10', '10+'],
    required: true
  },

  skills: [{ type: String }],

  vacancies: {
    type: Number,
    default: 1
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  featured: {
    type: Boolean,
    default: false
  },

  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],

  views: {
    type: Number,
    default: 0
  },

  expiresAt: Date,

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  // ✅ External API fields
  externalId: {
    type: String,
    unique: true,
    sparse: true
  },

  source: {
    type: String,
    default: 'internal',
    enum: ['internal', 'jsearch', 'adzuna', 'remotive']
  },

  applyLink: String,

  postedDate: Date
});


// ✅ TEXT SEARCH INDEX
jobSchema.index({
  title: 'text',
  description: 'text',
  skills: 'text',
  location: 'text'
});


// ✅ COMPOUND INDEXES (NO DUPLICATES)
jobSchema.index({ location: 1, jobType: 1 });
jobSchema.index({ source: 1, postedDate: -1 });


// ✅ AUTO UPDATE & EXPIRY
jobSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'approved') {
    if (!this.expiresAt) {
      this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', jobSchema);