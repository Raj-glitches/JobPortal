const mongoose = require('mongoose');

const otpLogSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['register', 'login', 'forgot-password', 'change-mobile'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  verified: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// TTL index to auto-delete OTPs after expiration
otpLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to generate OTP
otpLogSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create OTP log
otpLogSchema.statics.createOTP = async function(mobile, purpose) {
  const otp = this.generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // Delete any existing OTPs for this mobile and purpose
  await this.deleteMany({ mobile, purpose, verified: false });
  
  const otpLog = await this.create({
    mobile,
    otp,
    purpose,
    expiresAt
  });
  
  return otpLog;
};

// Static method to verify OTP
otpLogSchema.statics.verifyOTP = async function(mobile, otp, purpose) {
  const otpLog = await this.findOne({
    mobile,
    purpose,
    verified: false
  }).sort({ createdAt: -1 });
  
  if (!otpLog) {
    throw new Error('OTP not found or already verified');
  }
  
  if (new Date() > otpLog.expiresAt) {
    throw new Error('OTP has expired');
  }
  
  if (otpLog.otp !== otp) {
    otpLog.attempts += 1;
    await otpLog.save();
    throw new Error('Invalid OTP');
  }
  
  otpLog.verified = true;
  await otpLog.save();
  
  return true;
};

module.exports = mongoose.model('OTPLog', otpLogSchema);

