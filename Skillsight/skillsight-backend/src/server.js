const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/job.routes");
const resumeRoutes = require("./routes/resume.routes");
const candidateRoutes = require("./routes/candidate.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const applicationRoutes = require("./routes/application.routes");
const mlRoutes = require("./routes/mlRoutes");
const authMiddleware = require("./middleware/auth.middleware");
const authorizeRoles = require("./middleware/role.middleware");

const app = express();
const uploadsRoot = path.join(__dirname, "uploads");
const resumesRoot = path.join(uploadsRoot, "resumes");

app.set("trust proxy", 1);

/* ✅ IMPORTANT: allow frontend (Vercel) */
app.use(cors({
  origin: "*", // you can restrict later
  credentials: true
}));

app.use(express.json());

/* static files */
app.use("/api/uploads", express.static(uploadsRoot));

if (!fs.existsSync(resumesRoot)) {
  fs.mkdirSync(resumesRoot, { recursive: true })
}

/* routes */
app.use("/api/ml", mlRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api", candidateRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/applications", applicationRoutes);

/* health */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

/* protected */
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});

app.get(
  "/api/recruiter-only",
  authMiddleware,
  authorizeRoles("recruiter"),
  (req, res) => {
    res.json({ message: "Recruiter access granted" });
  }
);

/* DB fixes */
async function ensureOptionalColumns() {
  await pool.query(`
    ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Applied'
  `);

  await pool.query(`
    ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS rejection_feedback TEXT
  `);

  await pool.query(`
    ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS user_id INTEGER
  `);

  await pool.query(`
    ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS resume_url TEXT
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS profile_photo TEXT
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0
  `);

  await pool.query(`
    ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS min_match_score INTEGER DEFAULT 75
  `);

  await pool.query(`
    ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS min_experience_years INTEGER DEFAULT 0
  `);

  await pool.query(`
    UPDATE jobs SET min_match_score = 75 WHERE min_match_score IS NULL
  `);

  await pool.query(`
    UPDATE jobs SET min_experience_years = 0 WHERE min_experience_years IS NULL
  `);

  await pool.query(`
    UPDATE applications SET status = 'Applied' WHERE status IS NULL
  `);

  await pool.query(`
    UPDATE applications
    SET user_id = candidate_id
    WHERE user_id IS NULL
  `);
}

/* start server */
const PORT = process.env.PORT || 5050;

async function startServer() {
  try {
    await ensureOptionalColumns();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
