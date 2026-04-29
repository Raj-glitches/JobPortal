const nodemailer = require('nodemailer');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS'];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.error(
    `[EMAIL SERVICE] Missing required environment variables: ${missingVars.join(', ')}. Email sending will fail.`
  );
}

// Determine secure flag based on port (465 = SSL, 587/2525 = STARTTLS)
const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
const secure = port === 465;

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port,
  secure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add TLS options for better compatibility with various providers
  tls: {
    rejectUnauthorized: false, // accept self-signed certs in dev; set true in production with valid certs
  },
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error.message);
  } else {
    console.log('Email transporter ready');
  }
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"Job Portal" <${process.env.EMAIL_USER || 'no-reply@jobportal.com'}>`,
    to: email,
    subject: 'Your Job Portal OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your OTP Code</h2>
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 20px; text-align: center; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">
          ${otp}
        </div>
        <p style="margin: 20px 0; color: #6b7280;">This OTP is valid for 5 minutes.</p>
        <p style="color: #6b7280;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #9ca3af; font-size: 14px;">&copy; ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error.message || error);
    throw new Error('Failed to send OTP email: ' + (error.message || 'Unknown error'));
  }
};

module.exports = { sendOTP };

