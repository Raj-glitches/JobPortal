import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ReactPaginate from 'react-paginate';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  FiMapPin,
  FiSearch,
  FiFilter,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiDownload,
  FiGlobe
} from 'react-icons/fi';
import { jobAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import JobSkeleton from '../components/common/JobSkeleton';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
    experience: searchParams.get('experience') || '',
    source: searchParams.get('source') || 'all',
    sort: searchParams.get('sort') || 'latest',
    salaryMin: '',
    salaryMax: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated, isJobSeeker } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, [pagination.page]);

  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.location) params.location = filters.location;
    if (filters.jobType) params.jobType = filters.jobType;
    if (filters.experience) params.experience = filters.experience;
    if (filters.salaryMin) params.salaryMin = filters.salaryMin;
    if (filters.salaryMax) params.salaryMax = filters.salaryMax;
    setSearchParams(params);
  }, [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await jobAPI.getJobs(params);
      setJobs(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));
    } catch (error) {
      toast.error('Failed to fetch jobs');
    }
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchJobs();
  };

  const handlePageChange = (data) => {
    setPagination(prev => ({ ...prev, page: data.selected + 1 }));
  };

  const handleSaveJob = async (jobId, e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to save jobs');
      return;
    }
    try {
      await userAPI.saveJob(jobId);
      toast.success('Job saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    }
  };

  const jobTypes = ['full-time', 'part-time', 'internship', 'contract', 'remote'];
  const experienceLevels = ['fresher', '0-1', '1-3', '3-5', '5-10', '10+'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
      <div className="container-app">
        {/* Search Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Job title, skills, or company"
                value={filters.search}
                onChange={handleFilterChange}
                className="input pl-12"
              />
            </div>
            <div className="flex-1 relative">
              <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={filters.location}
                onChange={handleFilterChange}
                className="input pl-12"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search Jobs
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FiFilter /> Filters
            </button>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div>
                <label className="label">Job Type</label>
                <select
                  name="jobType"
                  value={filters.jobType}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">All Types</option>
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Experience</label>
                <select
                  name="experience"
                  value={filters.experience}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">All Levels</option>
                  {experienceLevels.map(exp => (
                    <option key={exp} value={exp}>{exp === 'fresher' ? 'Fresher' : `${exp} years`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Min Salary (LPA)</label>
                <input
                  type="number"
                  name="salaryMin"
                  placeholder="Min"
                  value={filters.salaryMin}
                  onChange={handleFilterChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Max Salary (LPA)</label>
                <input
                  type="number"
                  name="salaryMax"
                  placeholder="Max"
                  value={filters.salaryMax}
                  onChange={handleFilterChange}
                  className="input"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {jobs.length} of {pagination.total} jobs
          </p>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <FiBriefcase className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No jobs found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/jobs/${job._id}`} className="block">
                  <div className="card hover:shadow-lg transition-all">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Company Logo */}
                      <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                        ) : (
                          <FiBriefcase className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">{job.companyName}</p>

                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <FiMapPin /> {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiBriefcase /> {job.jobType}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock /> {job.experience === 'fresher' ? 'Fresher' : `${job.experience} years`}
                          </span>
                          {job.salary && (
                            <span className="flex items-center gap-1">
                              <FiDollarSign /> ₹{job.salary.min / 100000}L - {job.salary.max / 100000}L
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.skills?.slice(0, 5).map((skill) => (
                            <span key={skill} className="text-xs px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => handleSaveJob(job._id, e)}
                          className="btn btn-outline text-sm"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <ReactPaginate
              previousLabel="Previous"
              nextLabel="Next"
              pageCount={pagination.totalPages}
              onPageChange={handlePageChange}
              containerClassName="flex justify-center gap-2"
              pageClassName="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              activeClassName="bg-primary-600 text-white border-primary-600"
              forcePage={pagination.page - 1}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;

