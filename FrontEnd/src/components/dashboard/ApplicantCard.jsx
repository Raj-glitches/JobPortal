import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiCheck, FiX, FiDownload, FiClock, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { applicationAPI } from '../../services/api';

const ApplicantCard = ({ application, onStatusChange }) => {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (status) => {
    setLoading(true);
    try {
      await applicationAPI.updateApplicationStatus(application._id, { status });
      toast.success('Status updated successfully');
      onStatusChange(application._id, status);
    } catch (error) {
      toast.error('Failed to update status');
    }
    setLoading(false);
  };

  const handleDownloadResume = () => {
    if (application.resume?.url) {
      window.open(application.resume.url, '_blank');
    }
  };

  const applicant = application.applicant;
  const job = application.job;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card border hover:shadow-lg transition-all duration-300"
    >
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Applicant Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            {applicant?.profilePhoto ? (
              <img src={applicant.profilePhoto} alt={applicant.name} className="w-14 h-14 object-cover rounded-lg" />
            ) : (
              <span className="text-2xl font-bold text-white">{applicant?.name?.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xl text-gray-900 dark:text-white truncate">{applicant?.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{applicant?.email}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{applicant?.mobile}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {applicant?.skills?.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="badge badge-sm badge-secondary text-xs">{skill}</span>
              ))}
              {applicant?.skills?.length > 3 && (
                <span className="text-xs text-gray-500">+{applicant.skills.length - 3} more</span>
              )}
            </div>
          </div>
        </div>

        {/* Job Info */}
        <div className="text-center lg:text-left">
          <h4 className="font-medium text-gray-900 dark:text-white">{job?.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{job?.companyName}</p>
        </div>

        {/* Applied Date */}
        <div className="text-center lg:text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Applied {new Date(application.appliedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Cover Letter Preview */}
        {application.coverLetter && (
          <div className="lg:col-span-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800 p-3 rounded-lg max-w-full line-clamp-2">
              "{application.coverLetter.substring(0, 150)}..."
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 justify-end lg:justify-start lg:ml-auto">
          <span className={`badge badge-lg px-3 py-2 font-medium ${
            application.status === 'applied' ? 'badge-warning' :
            application.status === 'viewed' ? 'badge-info' :
            application.status === 'shortlisted' ? 'badge-success' :
            application.status === 'rejected' ? 'badge-error' :
            'badge-accent'
          }`}>
            {application.status.toUpperCase()}
          </span>

          <button
            onClick={handleDownloadResume}
            disabled={!application.resume?.url}
            className="btn btn-outline btn-sm flex items-center gap-1"
            title="Download Resume"
          >
            <FiDownload />
            Resume
          </button>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-outline btn-sm">
              Actions
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
              <li>
                <button 
                  onClick={() => handleStatusChange('viewed')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <FiEye />
                  Mark as Viewed
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleStatusChange('shortlisted')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <FiCheck />
                  Shortlist
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleStatusChange('rejected')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <FiX />
                  Reject
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ApplicantCard;

