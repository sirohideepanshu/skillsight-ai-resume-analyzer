const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const pool = require("../config/db")
const { JWT_SECRET } = require("../config/env")
const authMiddleware = require("../middleware/auth.middleware")

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { name, email, password, role, experience_years } = req.body

  try {
    const existing = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, experience_years)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, hashedPassword, role || "student", experience_years || 0]
    )

    res.json({
      success: true,
      user: result.rows[0]
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// ================= LOGIN =================
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

    // 🔥 REAL JWT TOKEN (IMPORTANT)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile_photo: user.profile_photo
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// ================= GET ME =================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, profile_photo FROM users WHERE id = $1",
      [req.user.id]
    )

    res.json({ user: result.rows[0] })
  } catch (err) {
    res.status(401).json({ error: "Invalid token" })
  }
})

module.exports = router
