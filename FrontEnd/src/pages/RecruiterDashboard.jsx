import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiBriefcase, FiUsers, FiPlus, FiEdit2, FiTrash2, FiEye, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { jobAPI, applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostJob, setShowPostJob] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'full-time',
    experience: '1-3',
    skills: '',
    salaryMin: '',
    salaryMax: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        jobAPI.getMyJobs(),
        applicationAPI.getAllApplications()
      ]);
      setJobs(jobsRes.data.data);
      setApplications(appsRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
    setLoading(false);
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await jobAPI.createJob({
        ...newJob,
        skills: newJob.skills.split(',').map(s => s.trim())
      });
      toast.success('Job posted successfully!');
      setShowPostJob(false);
      setNewJob({
        title: '',
        description: '',
        location: '',
        jobType: 'full-time',
        experience: '1-3',
        skills: '',
        salaryMin: '',
        salaryMax: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobAPI.deleteJob(jobId);
      toast.success('Job deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      await applicationAPI.updateApplicationStatus(appId, { status });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const tabs = [
    { id: 'jobs', label: 'My Jobs', icon: FiBriefcase },
    { id: 'applications', label: 'Applications', icon: FiUsers },
    { id: 'post', label: 'Post Job', icon: FiPlus },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
      <div className="container-app">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="card sticky top-24">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-3">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-3xl font-bold text-primary-600">{user?.name?.charAt(0)}</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recruiter</p>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); if (tab.id === 'post') setShowPostJob(true); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${activeTab === tab.id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Posted Jobs</h2>
                  <button onClick={() => setShowPostJob(true)} className="btn btn-primary">
                    <FiPlus className="w-5 h-5 mr-2" /> Post New Job
                  </button>
                </div>

                {jobs.length === 0 ? (
                  <div className="card text-center py-12">
                    <FiBriefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No jobs posted</h3>
                    <p className="text-gray-500 mb-4">Post your first job to start receiving applications</p>
                    <button onClick={() => setShowPostJob(true)} className="btn btn-primary">Post a Job</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job._id} className="card">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                            <p className="text-sm text-gray-500">{job.location} • {job.jobType}</p>
                            <div className="flex gap-2 mt-2">
                              <span className={`badge ${job.status === 'approved' ? 'badge-success' : job.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                                {job.status}
                              </span>
                              <span className="badge badge-info">{job.applicants?.length || 0} applicants</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/jobs/${job._id}`} className="btn btn-outline text-sm">
                              <FiEye className="w-4 h-4" />
                            </Link>
                            <Link to={`/recruiter/jobs/${job._id}/applicants`} className="btn btn-outline text-sm">
                              <FiUsers className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDeleteJob(job._id)} className="btn btn-outline text-sm text-red-600">
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Applications</h2>

                {applications.length === 0 ? (
                  <div className="card text-center py-12">
                    <FiUsers className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No applications yet</h3>
                    <p className="text-gray-500">Applications will appear here when candidates apply</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app._id} className="card">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                                {app.applicant?.name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{app.applicant?.name}</h3>
                              <p className="text-sm text-gray-500">{app.job?.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                              className="input text-sm py-2"
                            >
                              <option value="applied">Applied</option>
                              <option value="viewed">Viewed</option>
                              <option value="shortlisted">Shortlist</option>
                              <option value="rejected">Reject</option>
                              <option value="hired">Hire</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Post Job Modal */}
        {showPostJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Post New Job</h2>
                <form onSubmit={handlePostJob}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="label">Job Title</label>
                      <input
                        type="text"
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Description</label>
                      <textarea
                        value={newJob.description}
                        onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                        className="input"
                        rows={4}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Location</label>
                      <input
                        type="text"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Job Type</label>
                      <select
                        value={newJob.jobType}
                        onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                        className="input"
                      >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="internship">Internship</option>
                        <option value="contract">Contract</option>
                        <option value="remote">Remote</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Experience</label>
                      <select
                        value={newJob.experience}
                        onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                        className="input"
                      >
                        <option value="fresher">Fresher</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Skills (comma separated)</label>
                      <input
                        type="text"
                        value={newJob.skills}
                        onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                        className="input"
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                    <div>
                      <label className="label">Min Salary (LPA)</label>
                      <input
                        type="number"
                        value={newJob.salaryMin}
                        onChange={(e) => setNewJob({ ...newJob, salaryMin: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Max Salary (LPA)</label>
                      <input
                        type="number"
                        value={newJob.salaryMax}
                        onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button type="button" onClick={() => setShowPostJob(false)} className="btn btn-secondary flex-1">Cancel</button>
                    <button type="submit" className="btn btn-primary flex-1">Post Job</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;

