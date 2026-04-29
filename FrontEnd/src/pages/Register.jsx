import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPhone, FiMail, FiLock, FiUser, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'jobseeker';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.sendOTP(formData.email, 'register');
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = formData;
      await register({
        ...dataToSend,
        otp
      });
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">J</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Join us and start your journey</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'jobseeker' })}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${formData.role === 'jobseeker' ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : 'text-gray-500'}`}
            >
              Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'recruiter' })}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${formData.role === 'recruiter' ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : 'text-gray-500'}`}
            >
              Employer
            </button>
          </div>

          {/* Forms */}
          { step === 1 ? (
            <form onSubmit={handleSendOTP}>
              <div className="mb-4">
                <label className="label">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input pl-12"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="label">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input pl-12"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="label">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-12"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input pl-12"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-4"
                >
                  <FiArrowLeft /> Change details
                </button>
                <label className="label">Enter OTP</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">OTP sent to {formData.email}</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3"
              >
                {loading ? 'Verifying...' : 'Verify & Register'}
              </button>
            </form>
          )}

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

