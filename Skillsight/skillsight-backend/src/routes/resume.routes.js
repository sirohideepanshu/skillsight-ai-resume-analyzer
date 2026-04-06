const express = require("express")
const router = express.Router()

const { uploadResume, getMyResume } = require("../controllers/resumeController")
const authMiddleware = require("../middleware/auth.middleware")
const upload = require("../middleware/upload.middleware")

// Upload resume
router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
)

// Get latest resume for logged in user
router.get(
  "/my-resume",
  authMiddleware,
  getMyResume
)

module.exports = router