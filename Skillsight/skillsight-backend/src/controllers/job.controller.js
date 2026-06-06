const pool = require("../config/db")

function normalizeDateInput(value) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

exports.createJob = async (req, res) => {
  try {
    const recruiter_id = req.user?.id || 1
    const {
      title,
      description,
      skill_weights,
      min_match_score,
      min_experience_years,
      apply_by_date
    } = req.body

    if (!title || !description) {
      return res.status(400).json({ error: "Missing fields" })
    }

    const weights = JSON.stringify(skill_weights || {})
    const parsedMinScore = Number(min_match_score)
    const minimumScore =
      Number.isFinite(parsedMinScore) && parsedMinScore >= 0 && parsedMinScore <= 100
        ? Math.round(parsedMinScore)
        : 75
    const parsedMinExperience = Number(min_experience_years)
    const minimumExperience =
      Number.isFinite(parsedMinExperience) && parsedMinExperience >= 0
        ? Math.round(parsedMinExperience)
        : 0
    const applyByDate = normalizeDateInput(apply_by_date)

    if (apply_by_date && !applyByDate) {
      return res.status(400).json({ error: "Invalid apply by date" })
    }

    const result = await pool.query(
       `INSERT INTO jobs
       (recruiter_id, title, description, skill_weights, min_match_score, min_experience_years, apply_by_date)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
       RETURNING *`,
      [recruiter_id, title, description, weights, minimumScore, minimumExperience, applyByDate]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error("Job creation error:", err.message, err)
    res.status(500).json({
      error: "Job creation failed",
      detail: process.env.NODE_ENV !== "production" ? err.message : undefined
    })
  }
}


exports.getJobs = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
      id,
      recruiter_id,
      title,
      description,
      skill_weights,
      min_match_score,
      min_experience_years,
      apply_by_date,
      created_at,
      CASE
        WHEN COALESCE(is_deleted, FALSE) THEN TRUE
        WHEN apply_by_date IS NOT NULL AND apply_by_date < CURRENT_DATE THEN TRUE
        ELSE FALSE
      END AS is_closed,
      CASE
        WHEN apply_by_date IS NOT NULL AND apply_by_date < CURRENT_DATE THEN 'Closed'
        ELSE 'Open'
      END AS status_label
      FROM jobs
      WHERE COALESCE(is_deleted, FALSE) = FALSE
      ORDER BY
        CASE
          WHEN apply_by_date IS NOT NULL AND apply_by_date < CURRENT_DATE THEN 1
          ELSE 0
        END,
        created_at DESC
    `)

    res.json(result.rows)

  } catch (err) {

    console.error(err)
    res.status(500).json({ error: "Failed to fetch jobs" })

  }

}

exports.deleteJob = async (req, res) => {
  try {
    const recruiterId = req.user?.id
    const jobId = req.params.id

    const result = await pool.query(
      `UPDATE jobs
       SET is_deleted = TRUE
       WHERE id = $1
         AND recruiter_id = $2
         AND COALESCE(is_deleted, FALSE) = FALSE
       RETURNING id`,
      [jobId, recruiterId]
    )

    if (!result.rows.length) {
      return res.status(404).json({ error: "Job not found" })
    }

    res.json({ message: "Job deleted successfully" })
  } catch (err) {
    console.error("Job delete error:", err)
    res.status(500).json({ error: "Failed to delete job" })
  }
}
