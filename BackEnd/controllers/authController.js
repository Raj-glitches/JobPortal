const User = require('../models/User');
const OTPLog = require('../models/OTPLog');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Send OTP to mobile number
exports.sendOTP = async (req, res, next) => {
  try {
    const { mobile, purpose } = req.body;

    if (!mobile || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number and purpose'
      });
    }

    // Validate mobile format
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid mobile number'
      });
    }

    // Check if user exists for register purpose
    if (purpose === 'register') {
      const existingUser = await User.findOne({ mobile });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number already registered'
        });
      }
    }

    // Generate and save OTP
    const otpLog = await OTPLog.createOTP(mobile, purpose);

    // In production, send OTP via Twilio or Firebase
    // For development, return OTP in response
    console.log(`OTP for ${mobile}: ${otpLog.otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production
      otp: otpLog.otp
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { mobile, otp, purpose } = req.body;

    if (!mobile || !otp || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile, OTP and purpose'
      });
    }

    await OTPLog.verifyOTP(mobile, otp, purpose);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, mobile, password, role, otp } = req.body;

    // Verify OTP first
    await OTPLog.verifyOTP(mobile, otp, 'register');

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or mobile'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      role: role || 'jobseeker',
      isVerified: true
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login with mobile and OTP
exports.login = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile and OTP'
      });
    }

    // Verify OTP
    await OTPLog.verifyOTP(mobile, otp, 'login');

    // Find user
    const user = await User.findOne({ mobile });

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
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

// Login with password (alternative)
exports.loginWithPassword = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile and password'
      });
    }

    const user = await User.findOne({ mobile }).select('+password');

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
    const { mobile } = req.body;

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this mobile number'
      });
    }

    // Generate OTP for password reset
    const otpLog = await OTPLog.createOTP(mobile, 'forgot-password');

    console.log(`Password Reset OTP for ${mobile}: ${otpLog.otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent for password reset',
      otp: otpLog.otp
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { mobile, otp, password } = req.body;

    // Verify OTP
    await OTPLog.verifyOTP(mobile, otp, 'forgot-password');

    const user = await User.findOne({ mobile });

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
    res.status(400).json({
      success: false,
      message: error.message
    });
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
    isVerified: user.isVerified
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData
  });
};

