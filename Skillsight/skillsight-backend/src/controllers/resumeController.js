const pool = require("../config/db")
const fs = require("fs")
const path = require("path")
const pdfParse = require("pdf-parse")
const axios = require("axios")

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

  const job = await pool.query(
    "SELECT description, skill_weights, min_match_score, min_experience_years FROM jobs WHERE id = $1",
    [jobId]
  )

  if (!job.rows.length) {
    throw new Error("Job not found")
  }

  const resumeFilePath = latestResume.file_path
  const normalizedResumePath = resumeFilePath.startsWith("uploads/")
    ? resumeFilePath
    : `uploads/resumes/${resumeFilePath.split("/").pop()}`
  const absoluteResumePath = path.resolve(process.cwd(), normalizedResumePath)

  const dataBuffer = fs.readFileSync(absoluteResumePath)
  const pdfData = await pdfParse(dataBuffer)
  const resumeText = (pdfData.text || "").trim()

  if (!resumeText) {
    throw new Error("Resume text extraction failed")
  }

  console.log("Sending resume to ML API")

  let aiResponse
  try {
    aiResponse = await axios.post(
      "http://localhost:8000/analyze-resume",
      {
        resume_text: resumeText,
        job_description: job.rows[0].description,
        skill_weights: job.rows[0].skill_weights || {}
      },
      { timeout: 20000 }
    )
  } catch (error) {
    const isUnavailable =
      error.code === "ECONNREFUSED" ||
      error.code === "ECONNABORTED" ||
      error.code === "ENOTFOUND"

    if (isUnavailable) {
      throw new Error("ML API is not reachable on port 8000. Start the SkillSight-AI server and try again.")
    }

    const detail =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message

    throw new Error(`ML analysis failed: ${detail}`)
  }

  console.log("ML Response:", aiResponse.data)

  const matchedSkills =
    aiResponse.data.matched_skills ||
    aiResponse.data.detected_skills ||
    []
  const missingSkills = aiResponse.data.missing_skills || []
  const score =
    aiResponse.data.score ??
    aiResponse.data.candidate_score ??
    0
  const suggestions = aiResponse.data.suggestions || []
  const minimumMatchScore = Number(job.rows[0].min_match_score ?? 75)
  const minimumExperienceYears = Number(job.rows[0].min_experience_years ?? 0)

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
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      latestResume.id,
      jobId,
      score,
      JSON.stringify(matchedSkills),
      JSON.stringify(missingSkills),
      JSON.stringify(suggestions)
    ]
  )

  if (candidateExperienceYears < minimumExperienceYears) {
    suggestions.unshift(
      `Minimum experience not met: requires ${minimumExperienceYears} year(s), candidate has ${candidateExperienceYears}.`
    )
  }

  const meetsScoreThreshold = score >= minimumMatchScore
  const meetsExperienceThreshold = candidateExperienceYears >= minimumExperienceYears
  const nextStatus =
    meetsScoreThreshold && meetsExperienceThreshold ? "Shortlisted" : "Rejected"
  const rejectionFeedback =
    nextStatus === "Rejected"
      ? suggestions.slice(0, 2).join(" ")
      || "Candidate does not have the same skillset as required for this role."
      : null

  await pool.query(
    `UPDATE applications
     SET status = $1,
         rejection_feedback = $4
     WHERE job_id = $2
       AND candidate_id = $3
       AND COALESCE(status, 'Applied') = 'Applied'`,
    [nextStatus, jobId, userId, rejectionFeedback]
  )

  return {
    score,
    min_match_score: minimumMatchScore,
    min_experience_years: minimumExperienceYears,
    candidate_experience_years: candidateExperienceYears,
    auto_status: nextStatus,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    suggestions
  }
}

// Get latest uploaded resume
exports.getMyResume = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await pool.query(
      `SELECT * FROM resumes
       WHERE user_id = $1
       ORDER BY id DESC
       LIMIT 1`,
      [userId]
    )

    res.json(result.rows[0] || null)

  } catch (err) {
    console.error("Fetch resume error:", err)
    res.status(500).json({ error: "Failed to fetch resume" })
  }
}


// Upload resume and analyze with AI
exports.uploadResume = async (req, res) => {

  try {

    const userId = req.user?.id || 1
    const jobId = req.body.jobId ? parseInt(req.body.jobId, 10) : null

    if (!req.file) {
      return res.status(400).json({ error: "Resume file not uploaded" })
    }

    // Store path as uploads/resumes/filename for correct URL (http://localhost:5050/uploads/resumes/file.pdf)
    const filePath = `uploads/resumes/${req.file.filename}`

    // Save resume
    const resumeResult = await pool.query(
      `INSERT INTO resumes (user_id, file_path)
       VALUES ($1,$2)
       RETURNING *`,
      [userId, filePath]
    )

    const resumeId = resumeResult.rows[0].id

    if (!jobId) {
      const applicationsResult = await pool.query(
        `SELECT job_id
         FROM applications
         WHERE candidate_id = $1
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
              file_path: filePath
            }
          })

          analysisResults.push({
            job_id: application.job_id,
            score: analysis.score,
            matched_skills: analysis.matched_skills,
            missing_skills: analysis.missing_skills
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
        resume: resumeResult.rows[0],
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
          file_path: filePath
        }
      })

      return res.json({
        message: "Resume analyzed successfully",
        ...analysis
      })
    } catch (analysisError) {
      console.error("Resume upload analysis error:", analysisError)
      return res.status(202).json({
        message: "Resume uploaded, but analysis did not complete",
        resume: resumeResult.rows[0],
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

exports.analyzeResumeForJob = analyzeResumeForJob
