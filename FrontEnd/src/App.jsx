import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/common/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Profile from './pages/Profile';

import UserDashboard from './pages/UserDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';

import About from './pages/About';
import Contact from './pages/Contact';
import JobApplicants from './pages/JobApplicants';
import Notifications from './pages/Notifications';





// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Not Logged In
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role Check
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};


// Dashboard Router
const DashboardRouter = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;

    case 'recruiter':
      return <RecruiterDashboard />;

    default:
      return <UserDashboard />;
  }
};


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>

        <Router>

          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

            {/* Navbar */}
            <Navbar />

            {/* Routes */}
            <Routes>

              {/* Public Routes */}
              <Route path="/" element={<Home />} />

              <Route path="/login" element={<Login />} />

              <Route path="/register" element={<Register />} />

              <Route path="/jobs" element={<Jobs />} />

              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />

              {/* Job Applicants Page */}
              <Route
                path="/recruiter/job-applicants/:jobId"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <JobApplicants />
                  </ProtectedRoute>
                }
              />

              {/* Protected Dashboard Route */}

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />


              {/* Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />


              {/* Recruiter Dashboard */}
              <Route
                path="/recruiter/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />


              {/* Admin Dashboard */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />


              {/* Fallback Route */}
              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />

            </Routes>


            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                },

                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },

                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />

          </div>

        </Router>

      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;