const express = require("express")
const router = express.Router()

const { getDashboardStats, getRecentApplications, getRankingCandidates } = require("../controllers/dashboard.controller")
const authMiddleware = require("../middleware/auth.middleware")

// Dashboard statistics
router.get(
  "/dashboard/stats",
  authMiddleware,
  getDashboardStats
)

// Recent applications for recruiter's jobs
router.get(
  "/dashboard/recent-applications",
  authMiddleware,
  getRecentApplications
)

// All candidates for ranking (applications + scores from candidate_analysis)
router.get(
  "/dashboard/ranking-candidates",
  authMiddleware,
  getRankingCandidates
)

module.exports = router