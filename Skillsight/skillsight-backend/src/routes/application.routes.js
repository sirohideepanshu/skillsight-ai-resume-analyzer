const express = require("express")
const router = express.Router()

const authMiddleware = require("../middleware/auth.middleware")
const {
  getMyApplications,
  createApplication,
  updateApplicationStatus
} = require("../controllers/applications.controller")

// Get my applications (with job details) for student dashboard
router.get("/", authMiddleware, getMyApplications)

// Apply to a job
router.post("/", authMiddleware, createApplication)

// Recruiter: set application status (Shortlisted / Rejected) so student sees feedback
router.patch("/:id", authMiddleware, updateApplicationStatus)

module.exports = router
