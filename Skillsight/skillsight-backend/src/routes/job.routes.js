const express = require("express")
const router = express.Router()

const jobController = require("../controllers/job.controller")
const authMiddleware = require("../middleware/auth.middleware")

// Create Job (Recruiter)
router.post(
  "/",
  authMiddleware,
  jobController.createJob
)

// Get All Jobs
router.get(
  "/",
  jobController.getJobs
)

module.exports = router