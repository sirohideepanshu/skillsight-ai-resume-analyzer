const pool = require("../config/db")

exports.createJob = async (req, res) => {
  try {
    const recruiter_id = req.user?.id || 1
    const { title, description, skill_weights, min_match_score, min_experience_years } = req.body

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

    const result = await pool.query(
       `INSERT INTO jobs
       (recruiter_id, title, description, skill_weights, min_match_score, min_experience_years)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6)
       RETURNING *`,
      [recruiter_id, title, description, weights, minimumScore, minimumExperience]
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
      title,
      description,
      skill_weights,
      min_match_score,
      min_experience_years,
      created_at
      FROM jobs
      ORDER BY created_at DESC
    `)

    res.json(result.rows)

  } catch (err) {

    console.error(err)
    res.status(500).json({ error: "Failed to fetch jobs" })

  }

}
