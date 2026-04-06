const express = require("express")
const router = express.Router()

const authMiddleware = require("../middleware/auth.middleware")
const pool = require("../config/db")
const { analyzeResumeForJob } = require("../controllers/resumeController")

function parseStoredArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

// Get my applications (with job details) for student dashboard
router.get("/", authMiddleware, async (req, res) => {
  try {
    const candidateId = req.user.id
    const result = await pool.query(
      `SELECT a.id AS application_id, a.job_id, a.created_at AS applied_at,
              a.status, a.rejection_feedback,
              j.title, j.description, j.skill_weights, j.min_experience_years, j.created_at AS job_created_at,
              ca.suggestions AS analysis_suggestions
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       LEFT JOIN LATERAL (
         SELECT ca.suggestions
         FROM candidate_analysis ca
         JOIN resumes r ON r.id = ca.resume_id
         WHERE ca.job_id = a.job_id
           AND r.user_id = a.candidate_id
         ORDER BY ca.id DESC
         LIMIT 1
       ) ca ON TRUE
       WHERE a.candidate_id = $1
       ORDER BY a.created_at DESC`,
      [candidateId]
    )
    const rows = result.rows.map((r) => ({
      ...r,
      status: r.status || "Applied",
      rejection_feedback: r.rejection_feedback || "",
      analysis_notes: parseStoredArray(r.analysis_suggestions)
    }))
    res.json(rows)
  } catch (err) {
    console.error("My applications error:", err)
    res.status(500).json({ error: "Failed to fetch applications" })
  }
})

// Apply to a job
router.post("/", authMiddleware, async (req, res) => {
  try {
    const candidateId = req.user.id
    const { job_id } = req.body

    if (!job_id) {
      return res.status(400).json({ error: "Job ID required" })
    }

    const existing = await pool.query(
      "SELECT * FROM applications WHERE job_id = $1 AND candidate_id = $2",
      [job_id, candidateId]
    )
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "You already applied" })
    }

    const result = await pool.query(
      `INSERT INTO applications (job_id, candidate_id)
       VALUES ($1, $2)
       RETURNING *`,
      [job_id, candidateId]
    )

    try {
      const analysis = await analyzeResumeForJob({
        userId: candidateId,
        jobId: job_id
      })

      if (analysis?.skipped) {
        return res.status(202).json({
          message: "Application submitted, but analysis was skipped.",
          application: result.rows[0],
          analysis_warning: analysis.reason
        })
      }

      return res.json({
        message: "Application submitted and analyzed",
        application: result.rows[0],
        analysis
      })
    } catch (analysisError) {
      console.error("Application analysis error:", analysisError)
      return res.status(202).json({
        message: "Application submitted, but resume analysis failed.",
        application: result.rows[0],
        analysis_error: analysisError.message
      })
    }
  } catch (err) {
    console.error("Application error:", err)
    res.status(500).json({ error: "Application failed" })
  }
})

// Recruiter: set application status (Shortlisted / Rejected) so student sees feedback
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const applicationId = req.params.id
    const { status, rejectionFeedback } = req.body
    const recruiterId = req.user.id

    if (!status || !["Applied", "Shortlisted", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Use Applied, Shortlisted, or Rejected" })
    }

    const check = await pool.query(
      `SELECT a.id FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.id = $1 AND j.recruiter_id = $2`,
      [applicationId, recruiterId]
    )
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" })
    }

    await pool.query(
      "UPDATE applications SET status = $1, rejection_feedback = $2 WHERE id = $3",
      [
        status,
        status === "Rejected" ? (rejectionFeedback || "").trim() : null,
        applicationId
      ]
    )
    const updated = await pool.query("SELECT * FROM applications WHERE id = $1", [applicationId])
    res.json(updated.rows[0])
  } catch (err) {
    console.error("Update application status error:", err)
    res.status(500).json({ error: "Update failed" })
  }
})

module.exports = router
