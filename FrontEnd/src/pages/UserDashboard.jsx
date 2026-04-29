import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiBriefcase, FiFileText, FiBell, FiSettings, FiUser, FiMapPin, FiMail, FiPhone, FiEdit2, FiExternalLink, FiClock } from 'react-icons/fi';
import { userAPI, jobAPI, applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, applicationsRes, savedJobsRes, recommendedRes] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getMyApplications(),
        userAPI.getSavedJobs(),
        userAPI.getRecommendedJobs()
      ]);
      setProfile(profileRes.data.data);
      setApplications(applicationsRes.data.data);
      setSavedJobs(savedJobsRes.data.data);
      setRecommendedJobs(recommendedRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBriefcase },
    { id: 'applications', label: 'Applications', icon: FiFileText },
    { id: 'saved', label: 'Saved Jobs', icon: FiBriefcase },
    { id: 'profile', label: 'Profile', icon: FiUser },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      applied: { class: 'badge-primary', label: 'Applied' },
      viewed: { class: 'badge-info', label: 'Viewed' },
      shortlisted: { class: 'badge-success', label: 'Shortlisted' },
      rejected: { class: 'badge-danger', label: 'Rejected' },
      hired: { class: 'badge-success', label: 'Hired' }
    };
    return statusMap[status] || statusMap.applied;
  };

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
                <div className="w-20 h-20 mx-auto rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden mb-3">
                  {profile?.profilePhoto ? (
                    <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-primary-600">{profile?.name?.charAt(0)}</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{profile?.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard Overview</h2>
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="card">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <FiBriefcase className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{applications.length}</p>
                        <p className="text-sm text-gray-500">Total Applications</p>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <FiFileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{savedJobs.length}</p>
                        <p className="text-sm text-gray-500">Saved Jobs</p>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <FiClock className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{applications.filter(a => a.status === 'applied').length}</p>
                        <p className="text-sm text-gray-500">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Applications */}
                <div className="card mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Applications</h3>
                  {applications.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No applications yet</p>
                  ) : (
                    <div className="space-y-4">
                      {applications.slice(0, 5).map((app) => (
                        <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{app.job?.title}</h4>
                            <p className="text-sm text-gray-500">{app.job?.companyName}</p>
                          </div>
                          <span className={`badge ${getStatusBadge(app.status).class}`}>{getStatusBadge(app.status).label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {applications.length > 5 && (
                    <button onClick={() => setActiveTab('applications')} className="text-primary-600 text-sm mt-4">View all applications</button>
                  )}
                </div>

                {/* Recommended Jobs */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommended Jobs</h3>
                  {recommendedJobs.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recommendations yet. Complete your profile!</p>
                  ) : (
                    <div className="grid gap-4">
                      {recommendedJobs.slice(0, 3).map((job) => (
                        <Link key={job._id} to={`/jobs/${job._id}`} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <FiBriefcase className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{job.title}</h4>
                            <p className="text-sm text-gray-500">{job.companyName} • {job.location}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Applications</h2>
                {applications.length === 0 ? (
                  <div className="card text-center py-12">
                    <FiFileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No applications yet</h3>
                    <p className="text-gray-500 mb-4">Start applying to jobs to see them here</p>
                    <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app._id} className="card">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <FiBriefcase className="w-7 h-7 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{app.job?.title}</h3>
                              <p className="text-sm text-gray-500">{app.job?.companyName} • {app.job?.location}</p>
                              <p className="text-xs text-gray-400 mt-1">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`badge ${getStatusBadge(app.status).class}`}>{getStatusBadge(app.status).label}</span>
                            <Link to={`/jobs/${app.job?._id}`} className="btn btn-outline text-sm">
                              View Job <FiExternalLink className="ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Saved Jobs Tab */}
            {activeTab === 'saved' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Saved Jobs</h2>
                {savedJobs.length === 0 ? (
                  <div className="card text-center py-12">
                    <FiBriefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved jobs</h3>
                    <p className="text-gray-500 mb-4">Save jobs to view them later</p>
                    <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedJobs.map((job) => (
                      <div key={job._id} className="card">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <FiBriefcase className="w-7 h-7 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                              <p className="text-sm text-gray-500">{job.companyName} • {job.location}</p>
                            </div>
                          </div>
                          <Link to={`/jobs/${job._id}`} className="btn btn-primary text-sm">
                            View Job
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h2>
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                    <button className="btn btn-outline text-sm">
                      <FiEdit2 className="w-4 h-4 mr-1" /> Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-500">Full Name</label>
                      <p className="font-medium text-gray-900 dark:text-white">{profile?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="font-medium text-gray-900 dark:text-white">{profile?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="font-medium text-gray-900 dark:text-white">{profile?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Location</label>
                      <p className="font-medium text-gray-900 dark:text-white">{profile?.location || 'Not set'}</p>
                    </div>
                  </div>

                  {profile?.skills?.length > 0 && (
                    <div className="mt-6">
                      <label className="text-sm text-gray-500 mb-2 block">Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <span key={skill} className="badge badge-primary">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile?.bio && (
                    <div className="mt-6">
                      <label className="text-sm text-gray-500 mb-2 block">Bio</label>
                      <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

