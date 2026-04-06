const pool = require('../config/db')
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

exports.getCandidatesForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId

    const missingAnalysis = await pool.query(
      `SELECT DISTINCT
          a.candidate_id,
          COALESCE(a.status, 'Applied') AS application_status,
          existing_analysis.id AS analysis_id,
          existing_analysis.matched_skills,
          existing_analysis.missing_skills
       FROM applications a
       LEFT JOIN LATERAL (
         SELECT ca.id, ca.matched_skills, ca.missing_skills
         FROM candidate_analysis ca
         JOIN resumes r ON r.id = ca.resume_id
         WHERE ca.job_id = a.job_id
           AND r.user_id = a.candidate_id
         ORDER BY ca.id DESC
         LIMIT 1
       ) existing_analysis ON TRUE
       WHERE a.job_id = $1`,
      [jobId]
    )

    for (const row of missingAnalysis.rows) {
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
          jobId
        })
      } catch (error) {
        console.error(
          `Job candidate backfill failed for candidate ${row.candidate_id} / job ${jobId}:`,
          error.message
        )
      }
    }

    const result = await pool.query(
      `
      SELECT 
        users.id AS user_id,
        users.name AS candidate_name,
        candidate_analysis.score,
        candidate_analysis.matched_skills,
        candidate_analysis.missing_skills,
        candidate_analysis.suggestions,
        COALESCE(users.experience_years, 0) AS experience_years,
        COALESCE(applications.status, 'Applied') AS status
      FROM candidate_analysis
      JOIN resumes ON candidate_analysis.resume_id = resumes.id
      JOIN users ON resumes.user_id = users.id
      LEFT JOIN applications
        ON applications.job_id = candidate_analysis.job_id
       AND applications.candidate_id = users.id
      WHERE candidate_analysis.job_id = $1
      ORDER BY candidate_analysis.score DESC
      `,
      [jobId]
    )

    const candidates = result.rows.map((candidate) => ({
      candidate_name: candidate.candidate_name,
      score: candidate.score != null ? Number(candidate.score) : null,
      matched_skills: candidate.matched_skills || [],
      missing_skills: candidate.missing_skills || [],
      suggestions: candidate.suggestions || [],
      experience: `${candidate.experience_years || 0} yrs`,
      status: candidate.status || "Applied"
    }))

    res.json(candidates)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
}
