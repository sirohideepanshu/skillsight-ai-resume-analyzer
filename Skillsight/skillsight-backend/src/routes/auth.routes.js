const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")          // ✅ ADDED
const pool = require("../config/db")         // ✅ ADDED

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' })
    }

    const user = result.rows[0]

    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' })
    }

    // ✅ ADDED TOKEN GENERATION
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    )

    // ✅ MODIFIED RESPONSE (added token)
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router