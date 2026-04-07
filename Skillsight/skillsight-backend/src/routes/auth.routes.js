const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const pool = require("../config/db")

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" })
    }

    const user = result.rows[0]

    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router