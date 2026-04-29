const User = require('../models/User');
const OTPLog = require('../models/OTPLog');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Send OTP to email
const { sendOTP } = require('../utils/emailService');

exports.sendOTP = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and purpose'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if user exists for register purpose
    if (purpose === 'register') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    // For login purpose, ensure user exists
    if (purpose === 'login') {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(400).json({
          success: false,
          message: 'No account found with this email. Please register first.'
        });
      }
      if (existingUser.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been blocked'
        });
      }
    }

    // Generate OTP but DO NOT save to DB yet
    const otpLog = await OTPLog.createOTP(email, purpose, ip);

    // Send OTP via email — if this fails, clean up the OTP record
    try {
      await sendOTP(email, otpLog.otp);
    } catch (emailError) {
      // Delete the created OTP record so user can retry without rate-limit
      await OTPLog.deleteOne({ _id: otpLog._id });
      throw new Error('Failed to send OTP email. Please try again.');
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP and purpose'
      });
    }

    await OTPLog.verifyOTP(email, otp, purpose);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password and OTP'
      });
    }

    // Verify OTP first
    await OTPLog.verifyOTP(email, otp, 'register');

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'jobseeker',
      isVerified: true
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login with email and OTP
exports.login = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Verify OTP
    await OTPLog.verifyOTP(email, otp, 'login');

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Login with password (alternative)
exports.loginWithPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Google OAuth login/register
exports.googleAuth = async (req, res, next) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide tokenId'
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      // Check if email already exists
      user = await User.findOne({ email: payload.email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = payload.sub;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          name: payload.name,
          email: payload.email,
          googleId: payload.sub,
          profilePhoto: payload.picture,
          isVerified: true,
          role: 'jobseeker'
        });
      }
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Generate and send OTP for password reset
    const otpLog = await OTPLog.createOTP(email, 'forgot-password', ip);

    try {
      await sendOTP(email, otpLog.otp);
    } catch (emailError) {
      await OTPLog.deleteOne({ _id: otpLog._id });
      throw new Error('Failed to send OTP email. Please try again.');
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email for password reset'
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP and new password'
      });
    }

    // Verify OTP
    await OTPLog.verifyOTP(email, otp, 'forgot-password');

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get current logged in user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    profilePhoto: user.profilePhoto,
    bio: user.bio,
    location: user.location,
    skills: user.skills,
    education: user.education,
    experience: user.experience,
    socialLinks: user.socialLinks,
    resume: user.resume,
    companyDetails: user.companyDetails,
    isVerified: user.isVerified
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData
  });
};

