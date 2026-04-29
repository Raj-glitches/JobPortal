# Profile System - Deep Analysis & Fix Plan

## 🔍 CURRENT STATE ANALYSIS

### Backend Issues Found:

1. **User Model (`models/User.js`)**
   - ❌ Missing `socialLinks` field (LinkedIn, GitHub, Portfolio)
   - ✅ Other fields exist (name, email, bio, skills, education, experience, resume, profilePhoto, companyDetails)

2. **User Controller (`controllers/userController.js`)**
   - ❌ `getProfile` returns FULL user document (includes password hash via `req.user` from protect middleware)
   - ❌ `updateProfile` missing `socialLinks` in allowedFields
   - ❌ `uploadProfilePhoto` uses `req.file.path` but NO multer middleware in routes
   - ❌ `uploadResume` uses `req.file.path/filename` but NO multer middleware in routes
   - ❌ No error handling for Cloudinary upload failures

3. **User Routes (`routes/userRoutes.js`)**
   - ❌ Missing multer middleware for `/upload-photo` and `/upload-resume`
   - ❌ No Cloudinary config imported

4. **Auth Controller (`controllers/authController.js`)**
   - ❌ `sendTokenResponse` returns LIMITED user data (missing bio, skills, location, etc.)
   - ❌ AuthContext stores this limited data, causing profile to appear empty after login

### Frontend Issues Found:

1. **No Profile.jsx page exists** - Navbar links to `/profile` but route doesn't exist
2. **App.jsx** - Missing `/profile` route
3. **AuthContext.jsx** - `updateUser` exists but profile updates don't refresh full user data
4. **API Service (`services/api.js`)** - ✅ All endpoints already defined correctly

### Missing Features:
- Profile page UI component
- Profile completion progress bar
- Saved jobs section on profile
- Applied jobs section on profile
- Recruiter company profile section
- Admin read-only profile view
- Profile photo upload with preview
- Resume upload with download

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: Backend Fixes

#### File 1: `BackEnd/models/User.js`
- Add `socialLinks` sub-document: `{ linkedin, github, portfolio }`

#### File 2: `BackEnd/controllers/userController.js`
- Fix `getProfile`: Use `User.findById().select('-password')` instead of `req.user`
- Fix `updateProfile`: Add `socialLinks` to allowedFields
- Fix `uploadProfilePhoto`: Better error handling, return full URL
- Fix `uploadResume`: Better error handling, return full URL

#### File 3: `BackEnd/routes/userRoutes.js`
- Import and configure multer middleware
- Add upload middleware to `/upload-photo` and `/upload-resume`

#### File 4: `BackEnd/middleware/uploadMiddleware.js` (NEW)
- Create multer + Cloudinary upload configuration

#### File 5: `BackEnd/controllers/authController.js`
- Fix `sendTokenResponse`: Include ALL user fields (bio, skills, location, profilePhoto, resume, companyDetails)

### Phase 2: Frontend Implementation

#### File 6: `FrontEnd/src/pages/Profile.jsx` (NEW)
- Complete profile page with:
  - Profile header with photo upload
  - Personal info form (name, email, bio, location)
  - Social links form (LinkedIn, GitHub, Portfolio)
  - Skills management (add/remove tags)
  - Education section (add/edit/delete)
  - Experience section (add/edit/delete)
  - Resume upload/download
  - Saved jobs tab
  - Applied jobs tab
  - Recruiter company profile tab
  - Profile completion progress bar
  - Skeleton loading states
  - Framer Motion animations
  - Dark mode support
  - Fully responsive

#### File 7: `FrontEnd/src/App.jsx`
- Add `/profile` protected route

#### File 8: `FrontEnd/src/context/AuthContext.jsx`
- After profile update, refresh user data in context

---

## 🎯 FILES TO EDIT

| # | File | Action |
|---|------|--------|
| 1 | `BackEnd/models/User.js` | Add socialLinks field |
| 2 | `BackEnd/controllers/userController.js` | Fix getProfile, updateProfile, uploads |
| 3 | `BackEnd/routes/userRoutes.js` | Add multer middleware |
| 4 | `BackEnd/middleware/uploadMiddleware.js` | CREATE - Multer+Cloudinary config |
| 5 | `BackEnd/controllers/authController.js` | Fix sendTokenResponse |
| 6 | `FrontEnd/src/pages/Profile.jsx` | CREATE - Full profile page |
| 7 | `FrontEnd/src/App.jsx` | Add /profile route |
| 8 | `FrontEnd/src/context/AuthContext.jsx` | Refresh user after update |

---

## ✅ TEST CASES

1. Register/Login → Profile page loads with user data
2. Update name/bio/location → Saves correctly, persists on reload
3. Upload profile photo → Shows preview, saves to Cloudinary
4. Upload resume → Shows filename, can download
5. Add skills → Tags render correctly
6. Add education → List renders, persists
7. Add experience → List renders, persists
8. Add social links → Links clickable
9. Recruiter → Company profile tab visible
10. Admin → Read-only badge shown
11. Saved jobs → Loads saved jobs list
12. Applied jobs → Loads applications with status

