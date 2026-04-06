
const { JWT_SECRET } = require('../config/env');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = 10;


const registerUser = async (req, res) => {
  try {
    console.log("REGISTER ROUTE HIT");

    const { name, email, password, role, experience_years } = req.body;

    console.log("Step 1 - Data received");

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    console.log("Step 2 - Checked existing user");

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Step 3 - Password hashed");

   const result = await pool.query(
  `INSERT INTO users (name, email, password_hash, role, experience_years)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING id, name, email, role, profile_photo, experience_years`,
  [name, email, hashedPassword, role, role === "student" ? Number(experience_years || 0) : 0],
);

    console.log("Step 4 - Insert successful");

    return res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("🔥 FULL REGISTER ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

   const result = await pool.query(
  'SELECT id, name, email, password_hash, role, profile_photo, experience_years FROM users WHERE email = $1',
  [email],
);
  
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_photo: user.profile_photo || null,
      experience_years: user.experience_years ?? 0,
    };
  const token = jwt.sign(
  { id: user.id, name: user.name, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: '1d' }
);

   

    return res.json({
      token,
      user: payload,
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, profile_photo, experience_years FROM users WHERE id = $1",
      [req.user.id]
    )

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ user: result.rows[0] })
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}

const updateCurrentUser = async (req, res) => {
  try {
    const { profile_photo } = req.body

    const result = await pool.query(
      `UPDATE users
       SET profile_photo = $1
       WHERE id = $2
       RETURNING id, name, email, role, profile_photo, experience_years`,
      [profile_photo || null, req.user.id]
    )

    res.json({ user: result.rows[0] })
  } catch (error) {
    console.error("Error in updateCurrentUser:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
};
