# Job Portal - Full Stack Application Plan

## Project Overview
A comprehensive job portal with three user roles (Job Seeker, Recruiter, Admin) featuring OTP authentication, Google OAuth, job posting, applications, and admin management.

## Tech Stack
- **Frontend**: React.js + Tailwind CSS + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Firebase OTP + Google OAuth
- **File Upload**: Cloudinary
- **State Management**: React Context API

## Folder Structure

### Backend (BackEnd/)
```
BackEnd/
├── config/
│   ├── db.js              # MongoDB connection
│   ├── firebase.js        # Firebase OTP config
│   └── cloudinary.js      # Cloudinary config
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── jobController.js
│   ├── applicationController.js
│   ├── adminController.js
│   └── notificationController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   ├── uploadMiddleware.js
│   └── validationMiddleware.js
├── models/
│   ├── User.js
│   ├── Job.js
│   ├── Application.js
│   ├── Company.js
│   ├── Notification.js
│   └── OTPLog.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── jobRoutes.js
│   ├── applicationRoutes.js
│   ├── adminRoutes.js
│   └── notificationRoutes.js
├── utils/
│   ├── errorHandler.js
│   ├── validators.js
│   └── jwtHelper.js
├── .env
├── package.json
└── server.js
```

### Frontend (FrontEnd/)
```
FrontEnd/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── Navbar.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── OTPVerification.jsx
│   │   │   └── GoogleLogin.jsx
│   │   ├── jobs/
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobList.jsx
│   │   │   ├── JobFilters.jsx
│   │   │   └── JobDetails.jsx
│   │   ├── dashboard/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   └── Chart.jsx
│   │   └── layout/
│   │       ├── Layout.jsx
│   │       └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── OTPVerification.jsx
│   │   ├── Jobs.jsx
│   │   ├── JobDetails.jsx
│   │   ├── UserDashboard.jsx
│   │   ├── RecruiterDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── PostJob.jsx
│   │   ├── Applications.jsx
│   │   ├── SavedJobs.jsx
│   │   ├── About.jsx
│   │   └── Contact.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── JobContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useJobs.js
│   │   └── useTheme.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── jobService.js
│   │   └── uploadService.js
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## Database Schemas

### User Collection
- _id, name, email, mobile, password, role (jobseeker/recruiter/admin), googleId, profilePhoto, resume, skills[], education[], experience[], isVerified, isBlocked, createdAt, updatedAt

### Job Collection
- _id, title, description, company, location, salary, jobType, experience, skills[], postedBy, status (pending/approved/rejected), createdAt

### Application Collection
- _id, job, applicant, status (applied/shortlisted/rejected/hired), resume, coverLetter, appliedAt

### Company Collection
- _id, user, name, description, logo, website, location, industry, foundedYear

### Notification Collection
- _id, user, title, message, type, read, createdAt

### OTPLog Collection
- _id, mobile, otp, purpose, expiresAt, verified

## API Endpoints

### Auth Routes
- POST /api/auth/register - Register with mobile
- POST /api/auth/send-otp - Send OTP to mobile
- POST /api/auth/verify-otp - Verify OTP
- POST /api/auth/login - Login with mobile/OTP
- POST /api/auth/google - Google OAuth login
- POST /api/auth/forgot-password - Forgot password
- POST /api/auth/reset-password - Reset password

### User Routes
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update profile
- POST /api/users/upload-resume - Upload resume
- POST /api/users/upload-photo - Upload profile photo

### Job Routes
- GET /api/jobs - Get all jobs (with filters)
- GET /api/jobs/:id - Get job details
- POST /api/jobs - Post new job (recruiter)
- PUT /api/jobs/:id - Update job
- DELETE /api/jobs/:id - Delete job
- GET /api/jobs/recommended - Get recommended jobs

### Application Routes
- POST /api/applications - Apply for job
- GET /api/applications/my - Get my applications
- GET /api/applications/job/:jobId - Get applicants (recruiter)
- PUT /api/applications/:id/status - Update application status

### Admin Routes
- GET /api/admin/users - Get all users
- GET /api/admin/jobs - Get all jobs (pending)
- PUT /api/admin/jobs/:id/approve - Approve job
- PUT /api/admin/users/:id/block - Block user
- GET /api/admin/analytics - Get analytics

## Implementation Steps

1. Set up backend server with Express
2. Configure MongoDB connection
3. Create all database models
4. Implement authentication with JWT
5. Create OTP verification system
6. Set up Google OAuth
7. Build all API routes
8. Configure frontend with Tailwind
9. Create all frontend pages and components
10. Integrate frontend with backend
11. Add dark/light mode
12. Test and verify

## Dependencies Needed

### Backend
- express, mongoose, dotenv, cors, jsonwebtoken, bcryptjs, twilio/firebase-admin, google-auth-library, cloudinary, multer, express-validator, helmet, morgan, express-rate-limit

### Frontend
- react-router-dom, axios, tailwindcss, postcss, autoprefixer, framer-motion, react-hot-toast, react-icons, react-chartjs-2, chart.js, react-paginate, react-select, date-fns

