const path = require("path")

const pool = require("../config/db")
const { analyzeResumeForJob } = require("./resumeController")

function getApplicationUserId(application) {
  return application.user_id || application.candidate_id || null
}

function getBaseUrl(req) {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, "")
  }

  const protocol = req.get("x-forwarded-proto") || req.protocol
  return `${protocol}://${req.get("host")}`
}

function buildResumeUrl(req, value) {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  const filename = path.basename(String(value))
  return `${getBaseUrl(req)}/api/uploads/resumes/${filename}`
}

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

exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id
    const result = await pool.query(
      `SELECT a.id AS application_id, a.job_id, a.created_at AS applied_at,
              a.status, a.rejection_feedback, a.resume_url,
              j.title, j.description, j.skill_weights, j.min_experience_years, j.created_at AS job_created_at,
              ca.suggestions AS analysis_suggestions
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       LEFT JOIN LATERAL (
         SELECT ca.suggestions
         FROM candidate_analysis ca
         JOIN resumes r ON r.id = ca.resume_id
         WHERE ca.job_id = a.job_id
           AND r.user_id = COALESCE(a.user_id, a.candidate_id)
         ORDER BY ca.id DESC
         LIMIT 1
       ) ca ON TRUE
       WHERE COALESCE(a.user_id, a.candidate_id) = $1
       ORDER BY a.created_at DESC`,
      [userId]
    )

    const rows = result.rows.map((row) => ({
      ...row,
      status: row.status || "Applied",
      rejection_feedback: row.rejection_feedback || "",
      resume_url: buildResumeUrl(req, row.resume_url),
      analysis_notes: parseStoredArray(row.analysis_suggestions)
    }))

    res.json(rows)
  } catch (err) {
    console.error("My applications error:", err)
    res.status(500).json({ error: "Failed to fetch applications" })
  }
}

exports.createApplication = async (req, res) => {
  try {
    const userId = req.user.id
    const { job_id } = req.body

    if (!job_id) {
      return res.status(400).json({ error: "Job ID required" })
    }

    const latestResumeResult = await pool.query(
      `SELECT id, file_path
       FROM resumes
       WHERE user_id = $1
       ORDER BY id DESC
       LIMIT 1`,
      [userId]
    )
    const latestResume = latestResumeResult.rows[0] || null
    const resumeUrl = latestResume ? buildResumeUrl(req, latestResume.file_path) : null

    const existing = await pool.query(
      `SELECT *
       FROM applications
       WHERE job_id = $1
         AND COALESCE(user_id, candidate_id) = $2`,
      [job_id, userId]
    )
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "You already applied" })
    }

    const result = await pool.query(
      `INSERT INTO applications (job_id, candidate_id, user_id, resume_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [job_id, userId, userId, resumeUrl]
    )

    try {
      const analysis = await analyzeResumeForJob({
        userId,
        jobId: job_id,
        resumeRecord: latestResume
          ? {
              id: latestResume.id,
              file_path: latestResume.file_path
            }
          : undefined
      })

      if (analysis?.skipped) {
        return res.status(202).json({
          message: "Application submitted, but analysis was skipped.",
          application: {
            ...result.rows[0],
            user_id: getApplicationUserId(result.rows[0]),
            resume_url: buildResumeUrl(req, result.rows[0].resume_url)
          },
          analysis_warning: analysis.reason
        })
      }

      return res.json({
        message: "Application submitted and analyzed",
        application: {
          ...result.rows[0],
          user_id: getApplicationUserId(result.rows[0]),
          resume_url: buildResumeUrl(req, result.rows[0].resume_url)
        },
        analysis
      })
    } catch (analysisError) {
      console.error("Application analysis error:", analysisError)
      return res.status(202).json({
        message: "Application submitted, but resume analysis failed.",
        application: {
          ...result.rows[0],
          user_id: getApplicationUserId(result.rows[0]),
          resume_url: buildResumeUrl(req, result.rows[0].resume_url)
        },
        analysis_error: analysisError.message
      })
    }
  } catch (err) {
    console.error("Application error:", err)
    res.status(500).json({ error: "Application failed" })
  }
}

exports.updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.id
    const { status, rejectionFeedback } = req.body
    const recruiterId = req.user.id

    if (!status || !["Applied", "Shortlisted", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Use Applied, Shortlisted, or Rejected" })
    }

    const check = await pool.query(
      `SELECT a.id
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.id = $1
         AND j.recruiter_id = $2`,
      [applicationId, recruiterId]
    )
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" })
    }

    await pool.query(
      `UPDATE applications
       SET status = $1,
           rejection_feedback = $2
       WHERE id = $3`,
      [
        status,
        status === "Rejected" ? (rejectionFeedback || "").trim() : null,
        applicationId
      ]
    )

    const updated = await pool.query("SELECT * FROM applications WHERE id = $1", [applicationId])
    const row = updated.rows[0]

    res.json({
      ...row,
      user_id: getApplicationUserId(row),
      resume_url: buildResumeUrl(req, row.resume_url)
    })
  } catch (err) {
    console.error("Update application status error:", err)
    res.status(500).json({ error: "Update failed" })
  }
}
