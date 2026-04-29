import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUsers, FiSearch, FiFilter } from 'react-icons/fi';
import ApplicantCard from '../components/dashboard/ApplicantCard';
import { applicationAPI, jobAPI } from '../services/api';
import JobSkeleton from '../components/common/JobSkeleton';

const JobApplicants = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredApplicants, setFilteredApplicants] = useState([]);

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  useEffect(() => {
    const filtered = applicants.filter(applicant => {
      const matchesSearch = applicant.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           applicant.applicant?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredApplicants(filtered);
  }, [applicants, searchTerm, statusFilter]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const [applicantsRes, jobRes] = await Promise.all([
        applicationAPI.getJobApplicants(jobId),
        jobAPI.getJob(jobId)
      ]);
      
      setApplicants(applicantsRes.data.data);
      setJob(jobRes.data.data);
    } catch (error) {
      toast.error('Failed to load applicants');
    }
    setLoading(false);
  };

  const handleStatusChange = (appId, status) => {
    setApplicants(prev => prev.map(app => 
      app._id === appId ? { ...app, status } : app
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
        <div className="container-app">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <JobSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
      <div className="container-app">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <FiUsers className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Job Applicants ({applicants.length})
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {job?.title} - {job?.companyName}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4 p-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search applicants by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select select-bordered"
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="viewed">Viewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
              <button
                onClick={fetchApplicants}
                className="btn btn-outline"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Applicants List */}
        {filteredApplicants.length === 0 ? (
          <div className="card text-center py-16">
            <FiUsers className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No applicants found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {loading ? 'Loading...' : searchTerm || statusFilter !== 'all' 
                ? 'No applicants match your filters' 
                : 'No applicants for this job yet'}
            </p>
            {!loading && searchTerm === '' && statusFilter === 'all' && (
              <p className="text-sm text-gray-500">Post the job and candidates will apply here!</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplicants.map((application) => (
              <ApplicantCard 
                key={application._id}
                application={application}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-primary-600">{applicants.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-success">{applicants.filter(a => a.status === 'shortlisted').length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Shortlisted</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-warning">{applicants.filter(a => a.status === 'applied').length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-error">{applicants.filter(a => a.status === 'rejected').length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicants;

