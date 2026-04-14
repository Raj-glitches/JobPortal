import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMapPin, FiBriefcase, FiClock, FiDollarSign, FiSave, FiShare2, FiArrowLeft, FiEye } from 'react-icons/fi';
import { jobAPI, applicationAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isJobSeeker, user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const response = await jobAPI.getJob(id);
      setJob(response.data.data);
      setHasApplied(response.data.hasApplied);
    } catch (error) {
      toast.error('Failed to fetch job details');
      navigate('/jobs');
    }
    setLoading(false);
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to apply');
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }

    if (!isJobSeeker) {
      toast.error('Only job seekers can apply');
      return;
    }

    setApplying(true);
    try {
      await applicationAPI.applyForJob(id, { coverLetter });
      toast.success('Application submitted successfully!');
      setHasApplied(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    }
    setApplying(false);
  };

  const handleSaveJob = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save jobs');
      return;
    }
    try {
      if (isSaved) {
        await userAPI.unsaveJob(id);
        toast.success('Job unsaved');
      } else {
        await userAPI.saveJob(id);
        toast.success('Job saved');
      }
      setIsSaved(!isSaved);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
      <div className="container-app">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6">
          <FiArrowLeft /> Back to Jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                  ) : (
                    <FiBriefcase className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{job.title}</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">{job.companyName}</p>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiMapPin /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiBriefcase /> {job.jobType}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiEye /> {job.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock /> {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags & Source */}
              <div className="flex flex-wrap gap-2 mb-6">
                {job.source && job.source !== 'internal' && (
                  <span className="badge badge-secondary flex items-center gap-1">
                    <FiGlobe /> {job.source.toUpperCase()}
                  </span>
                )}

                {job.skills?.map((skill) => (
                  <span key={skill} className="badge badge-primary">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Salary */}
              {job.salary && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <FiDollarSign className="w-5 h-5" />
                    <span className="font-semibold">₹{job.salary.min / 100000}L - {job.salary.max / 100000}L PA</span>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Job Description</h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{job.description}</p>
                </div>
              </div>

              {/* Requirements */}
              {job.requirements?.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requirements</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Responsibilities */}
              {job.responsibilities?.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Responsibilities</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Experience */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Experience</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {job.experience === 'fresher' ? 'Freshers Welcome' : `${job.experience} years`}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card sticky top-24"
            >
              {hasApplied ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <FiBriefcase className="w-8 h-8 text-green-600" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Applied Successfully!
                  </h3>

                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Your application has been submitted. Track status in your dashboard.
                  </p>

                  <Link to="/dashboard" className="btn btn-primary w-full mt-4">
                    View Applications
                  </Link>
                </div>
              ) : (
                <>
                  {job.applyLink ? (
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-full py-3 mb-4"
                    >
                      Apply on {job.source?.toUpperCase()}
                    </a>
                  ) : (
                    <button
                      onClick={handleApply}
                      disabled={applying || !isAuthenticated}
                      className="btn btn-primary w-full py-3 mb-4"
                    >
                      {applying ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}

                  {!isAuthenticated && (
                    <p className="text-sm text-center text-gray-500 mb-4">
                      <Link to="/login" className="text-primary-600 hover:underline">
                        Login
                      </Link>{' '}
                      to apply for this job
                    </p>
                  )}
                </>
              )}

              <div className="space-y-3">
                <button onClick={handleSaveJob} className="btn btn-outline w-full flex items-center justify-center gap-2">
                  <FiSave /> {isSaved ? 'Saved' : 'Save Job'}
                </button>
                <button className="btn btn-secondary w-full flex items-center justify-center gap-2">
                  <FiShare2 /> Share Job
                </button>
              </div>

              {/* Company Info */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">About Company</h3>
                {job.company?.companyDetails ? (
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>{job.company.companyDetails.companyDescription || 'No description available'}</p>
                    {job.company.companyDetails.website && (
                      <a href={job.company.companyDetails.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        Visit Website
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Company information not available</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default JobDetails;

