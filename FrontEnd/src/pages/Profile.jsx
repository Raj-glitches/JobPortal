import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiMapPin,
  FiBriefcase,
  FiBook,
  FiGithub,
  FiLinkedin,
  FiGlobe,
  FiUpload,
  FiDownload,
  FiTrash2,
  FiPlus,
  FiEdit3,
  FiSave,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiCamera,
  FiFileText,
  FiAward,
  FiClock,
  FiDollarSign,
  FiLink
} from 'react-icons/fi';

import { useAuth } from '../context/AuthContext';
import { userAPI, applicationAPI } from '../services/api';
import JobSkeleton from '../components/common/JobSkeleton';

export default function Profile() {
  const { user, updateUser, isJobSeeker } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('overview');
  const [edit, setEdit] = useState(false);
  const [apps, setApps] = useState([]);

  const photoRef = useRef(null);
  const resumeRef = useRef(null);

  const [fd, setFd] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    skills: [],
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: ''
    }
  });

  const [ns, setNs] = useState('');

  const [ne, setNe] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    currentlyStudying: false
  });

  const [nx, setNx] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    description: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const data = response.data.data;

      setProfile(data);

      setFd({
        name: data.name || '',
        email: data.email || '',
        bio: data.bio || '',
        location: data.location || '',
        skills: data.skills || [],
        socialLinks: data.socialLinks || {
          linkedin: '',
          github: '',
          portfolio: ''
        }
      });

      if (data.role === 'jobseeker') {
        const appRes = await applicationAPI.getMyApplications();
        setApps(appRes.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }

    setLoading(false);
  };

  const saveProfile = async (data) => {
    setSaving(true);

    try {
      const response = await userAPI.updateProfile(data);

      setProfile(response.data.data);
      updateUser(response.data.data);

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    }

    setSaving(false);
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await userAPI.uploadProfilePhoto(formData);

      setProfile((prev) => ({
        ...prev,
        profilePhoto: response.data.data
      }));

      updateUser({
        ...user,
        profilePhoto: response.data.data
      });

      toast.success('Photo uploaded');
    } catch {
      toast.error('Failed to upload photo');
    }
  };

  const uploadResume = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await userAPI.uploadResume(formData);

      setProfile((prev) => ({
        ...prev,
        resume: response.data.data
      }));

      toast.success('Resume uploaded');
    } catch {
      toast.error('Failed to upload resume');
    }
  };

  const addSkill = () => {
    const skill = ns.trim();

    if (!skill || fd.skills.includes(skill)) return;

    setFd((prev) => ({
      ...prev,
      skills: [...prev.skills, skill]
    }));

    setNs('');
  };

  const removeSkill = (skill) => {
    setFd((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill)
    }));
  };

  const addEducation = async () => {
    if (!ne.institution || !ne.degree) return;

    await saveProfile({
      education: [...(profile.education || []), ne]
    });

    setNe({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      currentlyStudying: false
    });
  };

  const addExperience = async () => {
    if (!nx.company || !nx.position) return;

    await saveProfile({
      experience: [...(profile.experience || []), nx]
    });

    setNx({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: ''
    });
  };

  const removeEducation = async (index) => {
    await saveProfile({
      education: profile.education.filter((_, i) => i !== index)
    });
  };

  const removeExperience = async (index) => {
    await saveProfile({
      experience: profile.experience.filter((_, i) => i !== index)
    });
  };

  const profileCompletion = () => {
    if (!profile) return 0;

    let completed = 0;

    ['name', 'email', 'bio', 'location', 'profilePhoto'].forEach((field) => {
      if (profile[field]) completed++;
    });

    ['skills', 'education', 'experience'].forEach((field) => {
      if (profile[field]?.length > 0) completed++;
    });

    return Math.round((completed / 6) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
        <div className="container-app">
          <JobSkeleton />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiUser },
    ...(isJobSeeker
      ? [
        { id: 'apps', label: 'Applications', icon: FiBriefcase },
        { id: 'saved', label: 'Saved Jobs', icon: FiBook }
      ]
      : [
        { id: 'company', label: 'Company Profile', icon: FiBriefcase }
      ]
    )
  ];



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
      <div className="container-app">

        {/* HEADER */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500"></div>

          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-12">

              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-800 bg-gray-100">
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiUser className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => photoRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full"
                >
                  <FiCamera />
                </button>

                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  onChange={uploadPhoto}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile?.name}
                </h1>

                <p className="text-gray-500 capitalize">
                  {profile?.role}
                </p>

                {profile?.location && (
                  <p className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <FiMapPin />
                    {profile.location}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
                <p className="text-sm text-gray-500">Profile Completion</p>
                <p className="font-bold text-lg">
                  {profileCompletion()}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">

              {/* PERSONAL INFO */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Personal Info</h2>

                  <button onClick={() => setEdit(!edit)}>
                    {edit ? <FiX /> : <FiEdit3 />}
                  </button>
                </div>

                {edit ? (
                  <div className="space-y-4">

                    <input
                      type="text"
                      value={fd.name}
                      onChange={(e) =>
                        setFd({ ...fd, name: e.target.value })
                      }
                      className="input"
                      placeholder="Name"
                    />

                    <textarea
                      value={fd.bio}
                      onChange={(e) =>
                        setFd({ ...fd, bio: e.target.value })
                      }
                      className="input min-h-[100px]"
                      placeholder="Bio"
                    />

                    <input
                      type="text"
                      value={fd.location}
                      onChange={(e) =>
                        setFd({ ...fd, location: e.target.value })
                      }
                      className="input"
                      placeholder="Location"
                    />

                    <button
                      onClick={() =>
                        saveProfile({
                          name: fd.name,
                          bio: fd.bio,
                          location: fd.location,
                          skills: fd.skills,
                          socialLinks: fd.socialLinks
                        })
                      }
                      className="btn btn-primary"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>

                  </div>
                ) : (
                  <div className="space-y-3">

                    <p className="flex items-center gap-2">
                      <FiMail />
                      {profile?.email}
                    </p>

                    {profile?.bio && (
                      <p>{profile.bio}</p>
                    )}

                    {profile?.location && (
                      <p className="flex items-center gap-2">
                        <FiMapPin />
                        {profile.location}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SKILLS */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold mb-4">Skills</h2>

                <div className="flex flex-wrap gap-2 mb-4">
                  {fd.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm flex items-center gap-2"
                    >
                      {skill}

                      <button onClick={() => removeSkill(skill)}>
                        <FiX />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ns}
                    onChange={(e) => setNs(e.target.value)}
                    className="input flex-1"
                    placeholder="Add Skill"
                  />

                  <button
                    onClick={addSkill}
                    className="btn btn-secondary"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {isJobSeeker && (
                <>
                  {/* RESUME */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
                    <h2 className="text-lg font-semibold mb-4">Resume</h2>

                    {profile?.resume?.url ? (
                      <div className="p-4 bg-green-50 rounded-xl mb-4">
                        <div className="flex items-center gap-2 mb-4">
                          <FiCheckCircle className="text-green-600" />
                          <span>Resume Uploaded</span>
                        </div>
                        <a
                          href={profile.resume.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary w-full flex items-center justify-center gap-2"
                        >
                          <FiDownload />
                          Download Resume
                        </a>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 rounded-xl mb-4">
                        <div className="flex items-center gap-2">
                          <FiAlertCircle className="text-yellow-600" />
                          <span>No resume uploaded</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => resumeRef.current?.click()}
                      className="btn btn-outline w-full mt-4 flex items-center justify-center gap-2"
                    >
                      <FiUpload />
                      {profile?.resume?.url ? 'Update Resume' : 'Upload Resume'}
                    </button>

                    <input
                      ref={resumeRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={uploadResume}
                      className="hidden"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}


        {/* COMPANY PROFILE */}
{tab === 'company' && !isJobSeeker && (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FiBriefcase />
          Company Profile
        </h2>

        <button className="text-sm text-blue-600 hover:underline">
          Edit
        </button>
      </div>

      {profile?.companyDetails?.companyName ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <img
              src={
                profile.companyDetails.companyLogo ||
                '/placeholder-company.png'
              }
              alt={profile.companyDetails.companyName}
              className="w-full h-40 object-cover rounded-xl mb-4"
            />
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2">
              {profile.companyDetails.companyName}
            </h3>

            <p className="text-gray-600 mb-4">
              {profile.companyDetails.companyDescription || 'No description'}
            </p>

            <div className="space-y-2 text-sm">

              <p>
                <FiMapPin className="inline mr-2" />
                {profile.companyDetails.companyLocation}
              </p>

              {profile.companyDetails.industry && (
                <p>
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {profile.companyDetails.industry}
                </p>
              )}

              {profile.companyDetails.companyWebsite && (
                <p>
                  <FiGlobe className="inline mr-2" />

                  <a
                    href={profile.companyDetails.companyWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                </p>
              )}

            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-12">

          <FiBriefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Complete Company Profile
          </h3>

          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Add your company details to start posting jobs and build employer brand
          </p>

          <button
            onClick={async () => {
              try {
                await userAPI.updateCompanyDetails({
                  companyName: 'My Company',
                  companyDescription: 'We are hiring!',
                  companyLocation: 'Remote',
                  industry: 'Technology'
                });

                toast.success(
                  'Company profile created! You can now post jobs.'
                );

                loadProfile();

              } catch (error) {
                toast.error('Failed to create company profile');
              }
            }}
            className="btn btn-primary"
          >
            Quick Setup
          </button>

        </div>
      )}
    </div>
  </div>
)}


        {/* APPLICATIONS */}
        {tab === 'apps' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">

            <h2 className="text-lg font-semibold mb-6">
              My Applications
            </h2>

            {apps.length === 0 ? (
              <div className="text-center py-10">
                <FiBriefcase className="w-14 h-14 mx-auto text-gray-400 mb-4" />
                <p>No applications yet</p>
              </div>
            ) : (
              <div className="space-y-4">

                {apps.map((app) => (
                  <div
                    key={app._id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <h3 className="font-semibold">
                      {app.job?.title}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {app.job?.companyName}
                    </p>

                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>{app.job?.location}</span>
                      <span>{app.status}</span>
                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}