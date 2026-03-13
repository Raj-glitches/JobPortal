# 🎯 JobPortal - Modern Full-Stack Job Portal

A complete, production-ready online job portal with professional UI/UX featuring mobile OTP authentication, role-based dashboards, job posting, applications, and admin management.

## 🛠️ Tech Stack

```
Frontend: React.js + Tailwind CSS + Vite
Backend: Node.js + Express.js + MongoDB
Authentication: JWT + Firebase OTP
File Upload: Cloudinary
UI: Dark/Light mode + Responsive design
```

## ✨ Features

### ✅ Authentication
- Mobile OTP registration & login
- Password-based login  
- Google OAuth (ready)
- JWT token-based auth
- Role-based access control

### ✅ Roles & Features
**Job Seeker**: Profile creation, job search, apply, save jobs, track applications
**Recruiter**: Post jobs, manage applicants, shortlist candidates
**Admin**: User management, job approval, analytics dashboard

### ✅ UI/UX
- Modern professional design
- Responsive across all devices
- Dark/Light theme
- Toast notifications
- Loading states & animations

## 📋 Prerequisites

1. **Node.js** (v18+)
2. **MongoDB** (local or MongoDB Atlas)
3. **npm/yarn**
4. **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Bhoomika-project
```

### 2. Install Dependencies

**Backend:**
```bash
cd BackEnd
npm install
```

**Frontend:**
```bash
cd ../FrontEnd
npm install
```

### 3. Environment Setup

**Backend (.env file) - `BackEnd/.env`:**
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/jobportal
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/jobportal

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Firebase (OTP)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (File Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key  
CLOUDINARY_API_SECRET=your-api-secret

# Twilio (Alternative OTP)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env - optional):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Add connection string to BackEnd/.env
```

### 5. Run the Application

**Backend:**
```bash
cd BackEnd
npm start
```
*Server running on http://localhost:5000*

**Frontend:**
```bash
cd FrontEnd  
npm run dev
```
*Frontend running on http://localhost:5173 (or next available port)*

## 📱 Test the Application

1. Open http://localhost:5173
2. Register with mobile number → Verify OTP
3. Create profile → Browse jobs → Apply
4. Switch to Recruiter account → Post jobs
5. Admin panel with analytics

## 🌐 API Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register user |
| `POST` | `/api/auth/send-otp` | Send OTP |
| `POST` | `/api/auth/verify-otp` | Verify OTP |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/jobs` | Get jobs (filters) |
| `POST` | `/api/jobs` | Post job (recruiter) |
| `POST` | `/api/applications` | Apply job |
| `GET` | `/api/admin/analytics` | Admin analytics |

**Health Check:** `GET /api/health`

## 📁 Folder Structure

```
Bhoomika-project/
├── BackEnd/           # Node.js API
│   ├── config/        # DB & services
│   ├── controllers/   # Business logic
│   ├── middleware/    # Auth & errors
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   └── server.js
├── FrontEnd/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/   # Auth & Theme
│   │   ├── pages/     # All pages
│   │   └── services/  # API calls
│   └── tailwind.config.js
└── README.md
```

## 🔧 Services Setup

### MongoDB Atlas
1. Create account: https://cloud.mongodb.com
2. Create cluster → Add IP whitelist (0.0.0.0/0 for testing)
3. Get connection string → Update `.env`

### Firebase (OTP)
1. Create Firebase project
2. Enable Authentication → Phone Auth
3. Generate Service Account Key
4. Update `.env` with credentials

### Twilio (Alternative OTP)
1. Create Twilio account
2. Buy phone number
3. Update `.env` with SID, Token, Phone

### Google OAuth
1. Google Cloud Console → Create project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized origins: `http://localhost:5173`

### Cloudinary
1. Create Cloudinary account
2. Get credentials → Update `.env`

## 🧪 Testing

```bash
# Test backend
curl http://localhost:5000/api/health

# Test registration (Postman)
POST http://localhost:5000/api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "mobile": "9876543210",
  "password": "123456"
}
```

## 🚀 Production Deployment

### Backend (Vercel/Netlify/Render)
1. Add all `.env` variables
2. Set `NODE_ENV=production`
3. Update `MONGODB_URI`

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Update API base URL

### Docker (Optional)
```dockerfile
# Dockerfile available in repo
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes & test
4. Submit PR with description

## 📄 License
MIT License - Feel free to use and modify!

## 👥 Support

- **Issues**: GitHub Issues
- **Discord**: [Link]
- **Email**: support@jobportal.com

---

**Built with ❤️ for developers worldwide**
