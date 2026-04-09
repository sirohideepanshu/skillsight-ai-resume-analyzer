const pool = require("../config/db")

const {
  analyzeResume,
  buildStoredResumeUrl,
  buildResumeFilePath
} = require("../ml/analyzeResume")

function normalizeStoredUrl(value) {
  if (!value) return null
  if (String(value).startsWith("/api/uploads/")) return String(value)
  return buildStoredResumeUrl(value)
}

async function analyzeResumeForJob({ userId, jobId, resumeRecord }) {
  if (!userId || !jobId) {
    throw new Error("userId and jobId are required for analysis")
  }

  let latestResume = resumeRecord

  if (!latestResume) {
    const resumeResult = await pool.query(
      `SELECT *
       FROM resumes
       WHERE user_id = $1
       ORDER BY id DESC
       LIMIT 1`,
      [userId]
    )
    latestResume = resumeResult.rows[0]
  }

  if (!latestResume) {
    return {
      skipped: true,
      reason: "No resume uploaded for this candidate"
    }
  }

  const jobResult = await pool.query(
    `SELECT description, skill_weights, min_match_score, min_experience_years
     FROM jobs
     WHERE id = $1`,
    [jobId]
  )

  if (!jobResult.rows.length) {
    throw new Error("Job not found")
  }

  const job = jobResult.rows[0]
  const filePath = buildResumeFilePath(latestResume.file_path)
  const mlAnalysis = await analyzeResume(filePath, job)
  const {
    score,
    detected_skills,
    missing_skills,
    suggestions,
    fallback,
    min_match_score,
    min_experience_years
  } = mlAnalysis

  const matchedSkills = detected_skills

  const candidateResult = await pool.query(
    `SELECT COALESCE(experience_years, 0) AS experience_years
     FROM users
     WHERE id = $1`,
    [userId]
  )
  const candidateExperienceYears = Number(candidateResult.rows[0]?.experience_years ?? 0)

  await pool.query(
    `DELETE FROM candidate_analysis
     WHERE job_id = $1
       AND resume_id IN (
         SELECT id FROM resumes WHERE user_id = $2
       )`,
    [jobId, userId]
  )

  await pool.query(
    `INSERT INTO candidate_analysis
     (resume_id, job_id, score, matched_skills, missing_skills, suggestions)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      latestResume.id,
      jobId,
      score,
      JSON.stringify(matchedSkills),
      JSON.stringify(missing_skills),
      JSON.stringify(suggestions)
    ]
  )

  const finalSuggestions = [...suggestions]

  if (candidateExperienceYears < min_experience_years) {
    finalSuggestions.unshift(
      `Minimum experience not met: requires ${min_experience_years} year(s), candidate has ${candidateExperienceYears}.`
    )
  }

  const meetsScoreThreshold = score >= min_match_score
  const meetsExperienceThreshold = candidateExperienceYears >= min_experience_years
  const nextStatus =
    meetsScoreThreshold && meetsExperienceThreshold ? "Shortlisted" : "Rejected"
  const rejectionFeedback =
    nextStatus === "Rejected"
      ? finalSuggestions.slice(0, 2).join(" ") ||
        "Candidate does not have the same skillset as required for this role."
      : null

  await pool.query(
    `UPDATE applications
     SET status = $1,
         rejection_feedback = $4
     WHERE job_id = $2
       AND COALESCE(user_id, candidate_id) = $3
       AND COALESCE(status, 'Applied') = 'Applied'`,
    [nextStatus, jobId, userId, rejectionFeedback]
  )

  return {
    score,
    min_match_score,
    min_experience_years,
    candidate_experience_years: candidateExperienceYears,
    auto_status: nextStatus,
    matched_skills: matchedSkills,
    missing_skills,
    suggestions: finalSuggestions,
    fallback
  }
}

async function getMyResume(req, res) {
  try {
    const userId = req.user.id

    const result = await pool.query(
      `SELECT *
       FROM resumes
       WHERE user_id = $1
       ORDER BY id DESC
       LIMIT 1`,
      [userId]
    )

    const resume = result.rows[0]

    if (!resume) {
      return res.json(null)
    }

    res.json({
      ...resume,
      file_url: normalizeStoredUrl(resume.file_path)
    })
  } catch (err) {
    console.error("Fetch resume error:", err)
    res.status(500).json({ error: "Failed to fetch resume" })
  }
}

async function uploadResume(req, res) {
  try {
    const userId = req.user?.id || 1
    const jobId = req.body.jobId ? parseInt(req.body.jobId, 10) : null

    if (!req.file) {
      return res.status(400).json({ error: "Resume file not uploaded" })
    }

    const fileUrl = buildStoredResumeUrl(req.file.filename)

    const resumeResult = await pool.query(
      `INSERT INTO resumes (user_id, file_path)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, fileUrl]
    )

    const savedResume = resumeResult.rows[0]
    const resumeId = savedResume.id
    const responseResume = {
      ...savedResume,
      file_url: fileUrl
    }

    await pool.query(
      `UPDATE applications
       SET resume_url = $1
       WHERE COALESCE(user_id, candidate_id) = $2`,
      [fileUrl, userId]
    )

    if (!jobId) {
      const applicationsResult = await pool.query(
        `SELECT job_id
         FROM applications
         WHERE COALESCE(user_id, candidate_id) = $1
         ORDER BY created_at DESC`,
        [userId]
      )

      const analysisResults = []
      const analysisErrors = []

      for (const application of applicationsResult.rows) {
        try {
          const analysis = await analyzeResumeForJob({
            userId,
            jobId: application.job_id,
            resumeRecord: {
              id: resumeId,
              file_path: fileUrl
            }
          })

          analysisResults.push({
            job_id: application.job_id,
            score: analysis.score,
            matched_skills: analysis.matched_skills,
            missing_skills: analysis.missing_skills,
            fallback: analysis.fallback
          })
        } catch (analysisError) {
          console.error("Resume analysis after upload failed:", analysisError)
          analysisErrors.push({
            job_id: application.job_id,
            error: analysisError.message
          })
        }
      }

      return res.json({
        message: "Resume uploaded successfully",
        resume: responseResume,
        analyzed_jobs: analysisResults,
        analysis_errors: analysisErrors
      })
    }

    try {
      const analysis = await analyzeResumeForJob({
        userId,
        jobId,
        resumeRecord: {
          id: resumeId,
          file_path: fileUrl
        }
      })

      return res.json({
        message: "Resume analyzed successfully",
        resume: responseResume,
        ...analysis
      })
    } catch (analysisError) {
      console.error("Resume upload analysis error:", analysisError)
      return res.status(202).json({
        message: "Resume uploaded, but analysis did not complete",
        resume: responseResume,
        analysis_error: analysisError.message
      })
    }
  } catch (error) {
    console.error("Resume upload error:", error)

    res.status(500).json({
      error: error.message
    })
  }
}

module.exports = {
  getMyResume,
  uploadResume,
  analyzeResumeForJob
}
