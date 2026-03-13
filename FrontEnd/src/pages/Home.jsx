import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiBriefcase, FiUsers, FiArrowRight, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { jobAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const { isAuthenticated, isJobSeeker } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await jobAPI.getFeaturedJobs();
        setFeaturedJobs(response.data.data);
      } catch (error) {
        console.error('Error fetching featured jobs:', error);
      }
    };
    fetchFeaturedJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${searchTerm}&location=${location}`);
  };

  const stats = [
    { icon: FiBriefcase, label: 'Active Jobs', value: '10,000+' },
    { icon: FiUsers, label: 'Companies', value: '5,000+' },
    { icon: FiTrendingUp, label: 'Placements', value: '50,000+' },
  ];

  const features = [
    {
      title: 'Smart Job Matching',
      description: 'Our AI algorithm matches you with the perfect job based on your skills and preferences.',
      icon: '🎯'
    },
    {
      title: 'Easy Applications',
      description: 'Apply to multiple jobs with just one click. Track all your applications in one place.',
      icon: '🚀'
    },
    {
      title: 'Resume Builder',
      description: 'Create professional resumes with our easy-to-use builder and stand out to employers.',
      icon: '📄'
    },
    {
      title: 'Expert Career Guidance',
      description: 'Get insights from industry experts and improve your chances of landing your dream job.',
      icon: '💡'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="container-app relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find Your <span className="gradient-text">Dream Job</span> Today
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with top companies, discover new opportunities, and take your career to the next level. Your dream job is just a click away.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 max-w-3xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Job title, skills, or company"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-12"
                  />
                </div>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="City, state, or remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input pl-12"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full mt-4 text-lg py-3">
                Search Jobs
              </button>
            </form>

            {/* Quick Links */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="text-sm text-gray-500">Popular:</span>
              {['Software Engineer', 'Marketing Manager', 'Data Analyst', 'UX Designer'].map((term) => (
                <button
                  key={term}
                  onClick={() => navigate(`/jobs?search=${term}`)}
                  className="text-sm text-primary-600 hover:text-primary-700 underline"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container-app">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-gray-500 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Featured Jobs</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore our curated list of top job opportunities from leading companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.slice(0, 6).map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card hover:shadow-lg"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <FiBriefcase className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                      <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{job.companyName}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge badge-primary">{job.jobType}</span>
                  <span className="badge badge-info">
                    <FiMapPin className="w-3 h-3 mr-1" /> {job.location}
                  </span>
                  {job.salary && (
                    <span className="badge badge-success">
                      ₹{job.salary.min / 100000}L - {job.salary.max / 100000}L
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.skills?.slice(0, 3).map((skill) => (
                    <span key={skill} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                      {skill}
                    </span>
                  ))}
                </div>

                <Link to={`/jobs/${job._id}`} className="btn btn-outline w-full mt-4">
                  View Details
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/jobs" className="btn btn-primary">
              View All Jobs <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose JobPortal?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We provide everything you need to accelerate your career growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container-app text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who found their dream jobs through JobPortal
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated && isJobSeeker ? (
              <Link to="/dashboard" className="btn bg-white text-primary-600 hover:bg-gray-100">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100">
                  Create Account
                </Link>
                <Link to="/jobs" className="btn border-2 border-white text-white hover:bg-white/10">
                  Browse Jobs
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-app">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center">
                  <FiBriefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">JobPortal</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted partner in finding the perfect job. We connect talent with opportunity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/jobs" className="hover:text-white">Browse Jobs</Link></li>
                <li><Link to="/register" className="hover:text-white">Create Account</Link></li>
                <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/register?role=recruiter" className="hover:text-white">Post a Job</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Sales</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} JobPortal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

