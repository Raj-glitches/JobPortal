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
  requirements: [{
    type: String
  }],
  responsibilities: [{
    type: String
  }],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Please provide company name']
  },
  companyLogo: {
    type: String
  },
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
  skills: [{
    type: String
  }],
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
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {\n    type: Date,\n    default: Date.now\n  },\n  // External API fields\n  externalId: {\n    type: String,\n    unique: true,\n    sparse: true,\n    index: true\n  },\n  source: {\n    type: String,\n    default: 'internal',\n    enum: ['internal', 'jsearch', 'adzuna', 'remotive']\n  },\n  applyLink: {\n    type: String\n  },\n  postedDate: {\n    type: Date\n  }\n});

// Index for search\njobSchema.index({ title: 'text', description: 'text', skills: 'text', location: 'text' });\n\n// External job indexes\njobSchema.index({ externalId: 1 }, { unique: true, sparse: true });\njobSchema.index({ location: 1, jobType: 1 });\njobSchema.index({ source: 1, postedDate: -1 });

// Set expiration
jobSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'approved') {
    if (!this.expiresAt) {
      this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', jobSchema);

