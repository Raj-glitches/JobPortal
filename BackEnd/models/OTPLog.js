const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpLogSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true
  },
  hashedOtp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['register', 'login', 'forgot-password'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  ip: {
    type: String
  },
  lastSent: {
    type: Date,
    default: Date.now
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Single TTL index to auto-delete OTPs after expiration
otpLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to generate OTP
otpLogSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create OTP log
otpLogSchema.statics.createOTP = async function(identifier, purpose, ip) {
  // Rate limiting: max 5 OTP per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await this.countDocuments({
    identifier,
    ip,
    lastSent: { $gte: oneHourAgo },
    verified: false
  });

  if (recentCount >= 5) {
    throw new Error('Too many OTP requests. Please try again in 1 hour.');
  }

  const otp = this.generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Delete any existing OTPs for this identifier and purpose
  await this.deleteMany({ identifier, purpose, verified: false });

  const otpLog = await this.create({
    identifier,
    hashedOtp,
    purpose,
    ip,
    expiresAt,
    lastSent: new Date()
  });

  return {
    ...otpLog.toObject(),
    otp // raw OTP returned for email only
  };
};

// Static method to verify OTP
otpLogSchema.statics.verifyOTP = async function(identifier, otp, purpose) {
  const otpLog = await this.findOne({
    identifier,
    purpose,
    verified: false
  }).sort({ createdAt: -1 });

  if (!otpLog) {
    throw new Error('OTP not found or already verified');
  }

  if (new Date() > otpLog.expiresAt) {
    throw new Error('OTP has expired');
  }

  if (otpLog.attempts >= 3) {
    throw new Error('Too many failed attempts. Please request a new OTP.');
  }

  const isMatch = await bcrypt.compare(otp, otpLog.hashedOtp);
  if (!isMatch) {
    otpLog.attempts += 1;
    await otpLog.save();
    throw new Error('Invalid OTP');
  }

  otpLog.verified = true;
  await otpLog.save();

  return true;
};

module.exports = mongoose.model('OTPLog', otpLogSchema);

