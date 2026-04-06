const express = require('express')
const router = express.Router()
const axios = require('axios')

// POST /api/ml/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { resume_text, job_description } = req.body

    const response = await axios.post(
      process.env.ML_API_URL,   // must be correct
      {
        resume_text,
        job_description,
        skill_weights: {}   // REQUIRED
      }
    )

    res.json({
      success: true,
      data: response.data
    })

  } catch (error) {
    console.error("ML ERROR:", error.response?.data || error.message)

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    })
  }
})

module.exports = router