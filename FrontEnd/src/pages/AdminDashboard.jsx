import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUsers, FiBriefcase, FiCheck, FiX, FiShield, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, jobsRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getAllUsers({ limit: 10 }),
        adminAPI.getAllJobs({ limit: 10 })
      ]);
      setAnalytics(analyticsRes.data.data);
      setUsers(usersRes.data.data);
      setJobs(jobsRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
    setLoading(false);
  };

  const handleBlockUser = async (userId) => {
    try {
      await adminAPI.blockUser(userId);
      toast.success('User blocked');
      fetchData();
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  const handleApproveJob = async (jobId) => {
    try {
      await adminAPI.approveJob(jobId);
      toast.success('Job approved');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve job');
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      await adminAPI.rejectJob(jobId);
      toast.success('Job rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject job');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'jobs', label: 'Jobs', icon: FiBriefcase },
  ];

  const userChartData = {
    labels: ['Job Seekers', 'Recruiters', 'Blocked'],
    datasets: [{
      data: [analytics?.users?.jobSeekers || 0, analytics?.users?.recruiters || 0, analytics?.users?.blocked || 0],
      backgroundColor: ['#3b82f6', '#10b981', '#ef4444']
    }]
  };

  const jobChartData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: [analytics?.jobs?.approved || 0, analytics?.jobs?.pending || 0, analytics?.jobs?.rejected || 0],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
    }]
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
                <div className="w-20 h-20 mx-auto rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-3">
                  <FiShield className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Admin</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="card">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <FiUsers className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.users?.total || 0}</p>
                        <p className="text-sm text-gray-500">Total Users</p>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <FiBriefcase className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.jobs?.total || 0}</p>
                        <p className="text-sm text-gray-500">Total Jobs</p>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <FiCheck className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.applications?.total || 0}</p>
                        <p className="text-sm text-gray-500">Applications</p>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                        <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.jobs?.pending || 0}</p>
                        <p className="text-sm text-gray-500">Pending Jobs</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Users Distribution</h3>
                    <div className="h-64">
                      <Doughnut data={userChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Jobs Status</h3>
                    <div className="h-64">
                      <Doughnut data={jobChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Users</h3>
                    <div className="space-y-3">
                      {users.slice(0, 5).map((u) => (
                        <div key={u._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                          </div>
                          <span className="badge badge-primary">{u.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Jobs</h3>
                    <div className="space-y-3">
                      {jobs.slice(0, 5).map((job) => (
                        <div key={job._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{job.title}</p>
                            <p className="text-sm text-gray-500">{job.companyName}</p>
                          </div>
                          <span className={`badge ${job.status === 'approved' ? 'badge-success' : job.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                            {job.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Management</h2>
                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Email</th>
                          <th className="text-left py-3 px-4">Role</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u._id} className="border-b">
                            <td className="py-3 px-4">{u.name}</td>
                            <td className="py-3 px-4">{u.email}</td>
                            <td className="py-3 px-4">
                              <span className="badge badge-primary">{u.role}</span>
                            </td>
                            <td className="py-3 px-4">
                              {u.isBlocked ? (
                                <span className="badge badge-danger">Blocked</span>
                              ) : (
                                <span className="badge badge-success">Active</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {!u.isBlocked && u.role !== 'admin' && (
                                <button
                                  onClick={() => handleBlockUser(u._id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Block
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Job Management</h2>
                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Title</th>
                          <th className="text-left py-3 px-4">Company</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job) => (
                          <tr key={job._id} className="border-b">
                            <td className="py-3 px-4">{job.title}</td>
                            <td className="py-3 px-4">{job.companyName}</td>
                            <td className="py-3 px-4">
                              <span className={`badge ${job.status === 'approved' ? 'badge-success' : job.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                                {job.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {job.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveJob(job._id)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectJob(job._id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

