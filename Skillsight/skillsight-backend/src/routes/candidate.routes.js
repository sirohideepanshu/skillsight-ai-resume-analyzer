const express = require("express")
const router = express.Router()

const { getCandidatesForJob } = require("../controllers/candidate.controller")
const { getRankingCandidates } = require("../controllers/dashboard.controller")
const authMiddleware = require("../middleware/auth.middleware")

router.get(
  "/candidates/ranking",
  authMiddleware,
  getRankingCandidates
)

// Recruiter: see candidates who applied to a job
router.get(
  "/jobs/:jobId/candidates",
  authMiddleware,
  getCandidatesForJob
)

module.exports = router
