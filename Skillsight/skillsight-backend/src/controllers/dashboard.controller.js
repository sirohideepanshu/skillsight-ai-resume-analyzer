const path = require("path")

const pool = require("../config/db")
const { analyzeResumeForJob } = require("./resumeController")

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

async function backfillMissingAnalysis(recruiterId) {
  const result = await pool.query(
    `SELECT DISTINCT
        a.job_id,
        COALESCE(a.user_id, a.candidate_id) AS candidate_id,
        COALESCE(a.status, 'Applied') AS application_status,
        existing_analysis.id AS analysis_id,
        existing_analysis.matched_skills,
        existing_analysis.missing_skills
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
       LEFT JOIN LATERAL (
         SELECT ca.id, ca.matched_skills, ca.missing_skills
         FROM candidate_analysis ca
         JOIN resumes r ON r.id = ca.resume_id
         WHERE ca.job_id = a.job_id
         AND r.user_id = COALESCE(a.user_id, a.candidate_id)
         ORDER BY ca.id DESC
         LIMIT 1
       ) existing_analysis ON TRUE
     WHERE j.recruiter_id = $1`,
    [recruiterId]
  )

  for (const row of result.rows) {
    const matchedSkills = parseStoredArray(row.matched_skills)
    const missingSkills = parseStoredArray(row.missing_skills)
    const needsAnalysis =
      !row.analysis_id ||
      (matchedSkills.length === 0 && missingSkills.length === 0) ||
      row.application_status === "Applied"

    if (!needsAnalysis) continue

    try {
      await analyzeResumeForJob({
        userId: row.candidate_id,
        jobId: row.job_id
      })
    } catch (error) {
      console.error(
        `Ranking backfill failed for candidate ${row.candidate_id} / job ${row.job_id}:`,
        error.message
      )
    }
  }
}

exports.getDashboardStats = async (req, res) => {
  try {
    const recruiterId = req.user.id

    // total jobs created by recruiter
    const jobsResult = await pool.query(
      `SELECT COUNT(*) FROM jobs WHERE recruiter_id=$1`,
      [recruiterId]
    )

    const totalJobs = parseInt(jobsResult.rows[0].count)

    // total applications (from applications table - students who clicked Apply)
    const appsResult = await pool.query(
      `SELECT COUNT(*) FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE j.recruiter_id = $1`,
      [recruiterId]
    )

    const totalApplications = parseInt(appsResult.rows[0].count)

    // shortlisted candidates (score >= 80)
    const shortlistedResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM candidate_analysis
      JOIN jobs ON candidate_analysis.job_id = jobs.id
      WHERE jobs.recruiter_id=$1 AND candidate_analysis.score >= 80
      `,
      [recruiterId]
    )

    const shortlistedCandidates = parseInt(shortlistedResult.rows[0].count)

    // average score
    const avgScoreResult = await pool.query(
      `
      SELECT AVG(score) 
      FROM candidate_analysis
      JOIN jobs ON candidate_analysis.job_id = jobs.id
      WHERE jobs.recruiter_id=$1
      `,
      [recruiterId]
    )

    const averageScore = Math.round(avgScoreResult.rows[0].avg || 0)

    res.json({
      activeJobs: totalJobs,
      totalJobs,
      totalApplications,
      shortlistedCandidates,
      shortlisted: shortlistedCandidates,
      averageScore,
      avgScore: averageScore
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

exports.getRecentApplications = async (req, res) => {
  try {
    const recruiterId = req.user.id
    const result = await pool.query(
      `SELECT a.id AS application_id, a.job_id, a.created_at AS applied_at,
              j.title AS job_title,
              a.status, a.rejection_feedback,
              u.id AS candidate_id, u.name AS candidate_name, u.email AS candidate_email,
              COALESCE(a.resume_url, lr.file_path) AS resume_url
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN users u ON u.id = COALESCE(a.user_id, a.candidate_id)
       LEFT JOIN LATERAL (
         SELECT r.file_path
         FROM resumes r
         WHERE r.user_id = COALESCE(a.user_id, a.candidate_id)
         ORDER BY r.id DESC
         LIMIT 1
       ) lr ON TRUE
       WHERE j.recruiter_id = $1
       ORDER BY a.created_at DESC
       LIMIT 50`,
      [recruiterId]
    )
    const rows = result.rows.map((row) => ({
      ...row,
      status: row.status || "Applied",
      resume_url: buildResumeUrl(req, row.resume_url),
      resume_file_path: row.resume_url
    }))
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

// Ranking table: all applications for recruiter's jobs with optional candidate_analysis (score, skills)
exports.getRankingCandidates = async (req, res) => {
  try {
    const recruiterId = req.user.id

    await backfillMissingAnalysis(recruiterId)

    const result = await pool.query(
      `SELECT a.id AS application_id, a.job_id,
              COALESCE(a.user_id, a.candidate_id) AS candidate_id,
              a.created_at AS applied_at,
              j.title AS job_title,
              COALESCE(j.min_experience_years, 0) AS min_experience_years,
              a.status, a.rejection_feedback,
              u.name AS candidate_name, u.email AS candidate_email,
              COALESCE(u.experience_years, 0) AS experience_years,
              COALESCE(a.resume_url, lr.file_path) AS resume_url,
              ca.score, ca.matched_skills, ca.missing_skills, ca.suggestions
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN users u ON u.id = COALESCE(a.user_id, a.candidate_id)
       LEFT JOIN LATERAL (
         SELECT r.file_path
         FROM resumes r
         WHERE r.user_id = COALESCE(a.user_id, a.candidate_id)
         ORDER BY r.id DESC
         LIMIT 1
       ) lr ON TRUE
       LEFT JOIN LATERAL (
         SELECT ca.score, ca.matched_skills, ca.missing_skills, ca.suggestions
         FROM candidate_analysis ca
         JOIN resumes r ON r.id = ca.resume_id
         WHERE ca.job_id = a.job_id
           AND r.user_id = COALESCE(a.user_id, a.candidate_id)
         ORDER BY ca.id DESC
         LIMIT 1
       ) ca ON TRUE
       WHERE j.recruiter_id = $1
       ORDER BY ca.score DESC NULLS LAST, a.created_at DESC`,
      [recruiterId]
    )
    const byAppId = new Map()
    for (const row of result.rows) {
      const withStatus = {
        ...row,
        status: row.status || "Applied",
        resume_url: buildResumeUrl(req, row.resume_url),
        resume_file_path: row.resume_url
      }
      if (!byAppId.has(row.application_id)) byAppId.set(row.application_id, withStatus)
      else {
        const existing = byAppId.get(row.application_id)
        if (row.score != null && existing.score == null) byAppId.set(row.application_id, withStatus)
      }
    }
    res.json(Array.from(byAppId.values()))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}
