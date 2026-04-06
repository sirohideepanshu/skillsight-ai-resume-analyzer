const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../config/db');

// POST /api/ml/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { resume_text, job_description, user_id, job_id } = req.body;

    // 1️⃣ Call ML API
    const mlResponse = await axios.post(process.env.ML_API_URL, {
  resume_text,
  job_description,
  skill_weights: {}   // REQUIRED 🔥
});

    const result = mlResponse.data;

    // Example ML response expected:
    // {
    //   score: 85,
    //   matched_skills: [...],
    //   missing_skills: [...],
    //   suggestions: [...]
    // }

    // 2️⃣ Store in DB
    const query = `
      INSERT INTO candidate_analysis 
      (resume_id, job_id, score, matched_skills, missing_skills, suggestions)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      user_id, // or resume_id if you track separately
      job_id,
      result.score,
      JSON.stringify(result.matched_skills),
      JSON.stringify(result.missing_skills),
      JSON.stringify(result.suggestions)
    ];

    const dbResult = await pool.query(query, values);

    // 3️⃣ Send response back
    res.json({
      success: true,
      data: dbResult.rows[0]
    });

  } catch (error) {
    console.error('ML ERROR:', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;