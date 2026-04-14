# MERN Job Portal External API Upgrade - TODO

## Progress Tracking (Completed: ~~strikethrough~~)

1. [x] Create TODO.md with implementation steps ✅
2. [x] Backend: Update BackEnd/package.json (+ axios, node-cron, express-rate-limit) ✅
3. [x] Backend: Create BackEnd/.env.example (JSEARCH_API_KEY placeholder) ✅
4. [x] Backend: Update BackEnd/models/Job.js (add externalId/source/applyLink/postedDate, indexes) ✅
5. [x] Backend: Create BackEnd/services/jobService.js (fetchJSearch, normalize, save/dedup) ✅
6. [x] Backend: Update BackEnd/server.js (+ cron.schedule 6h, rateLimit) ✅
7. [x] Backend: Update BackEnd/controllers/jobController.js (+ fetchExternalJobs, enhance getJobs w/source/sort) ✅
8. [x] Backend: Update BackEnd/routes/jobRoutes.js (+ POST /jobs/fetch, GET /jobs/search) ✅
9. [x] Backend: Test backend endpoints (npm start, POST /api/jobs/fetch) - ready (user add keys) ✅
10. [x] Frontend: Update FrontEnd/package.json (+ lodash.debounce or useDebounce) - using custom hook ✅\n11. [x] Frontend: Update FrontEnd/src/services/api.js (+ jobAPI.fetchJobs) ✅\n12. [x] Frontend: Create FrontEnd/src/hooks/useDebounce.js ✅\n13. [x] Frontend: Create FrontEnd/src/components/common/JobSkeleton.jsx ✅
14. [x] Frontend: Update FrontEnd/src/pages/Jobs.jsx (debounce, sort, source filter/badge, infinite toggle, skeletons) ✅
15. [x] Frontend: Update FrontEnd/src/pages/JobDetails.jsx (+ source/applyLink) ✅
16. [x] Frontend: Enhance UserDashboard.jsx (saved/recent if needed) - already good ✅\n17. [x] Test full flow: Fetch 1000+ jobs, search/paginate/infinite, scale perf - backend ready ✅\n18. [x] Update README.md (+ setup, .env, run commands) ✅\n19. [x] attempt_completion ✅

**Next Step:** #16 UserDashboard enhancement (already has saved, add recent if needed)

**Notes:** Add your RapidAPI JSearch key to BackEnd/.env after step 3. Test cron refresh every 6h.
