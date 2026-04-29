import { useState } from 'react';
import { FiUpload, FiSend, FiX, FiUser, FiCheckCircle, FiMail} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { applicationAPI } from '../../services/api';

const ApplyJob = ({ job, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumePreview, setResumePreview] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match(/pdf|doc|docx/)) {
      setResumeFile(file);
      setResumePreview(file.name);
    } else {
      toast.error('Please upload PDF, DOC, or DOCX file only');
    }
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!user) {
        toast.error('Please login to apply');
        return;
      }

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('jobId', job._id);
        formData.append('coverLetter', coverLetter);
        if (resumeFile) formData.append('resume', resumeFile);

        await applicationAPI.applyForJob(job._id, formData);
        toast.success('Application submitted successfully!');
        onSuccess();
        onClose();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to apply');
      } finally {
        setLoading(false);
      }
    };



  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Apply for {job.title}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FiX className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Details Preview */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-6 rounded-xl">
          <h3 className="font-bold text-xl mb-2">{job.title}</h3>
          <p className="text-sm opacity-90">{job.companyName}</p>
          <p className="text-sm opacity-90">{job.location}</p>
          {job.salary && (
            <p className="text-sm opacity-90 mt-1">
              ₹{job.salary.min?.toLocaleString()} - ₹{job.salary.max?.toLocaleString()}
            </p>
          )}
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cover Letter (Optional)
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={4}
            placeholder="Tell the employer why you're perfect for this role..."
            className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
          />
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Resume
          </label>
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <FiUpload className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {resumePreview || 'Click to upload resume'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, DOC, DOCX (Max 5MB)
                </p>
              </div>
            </label>
          </div>
          {resumePreview && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <FiCheckCircle className="text-green-600 w-4 h-4" />
              <span className="text-sm text-green-800 dark:text-green-200 truncate">
                {resumePreview}
              </span>
              <button
                type="button"
                onClick={() => {
                  setResumeFile(null);
                  setResumePreview('');
                }}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <FiSend />
              Apply for this Job
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
        You'll receive email notifications about your application status.
      </p>
    </div>
  );
};

export default ApplyJob;

