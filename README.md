# SkillSight AI Resume Analyzer

SkillSight is a full-stack AI-assisted hiring and career platform with three parts:

- `Skillsight/frontend`: React + Vite student/recruiter UI
- `Skillsight/skillsight-backend`: Node.js + Express + PostgreSQL API
- `Skillsight-AI`: FastAPI-based resume analysis service

The project supports:

- student registration, login, resume upload, and job applications
- recruiter job creation, candidate review, rankings, and status updates
- AI-based resume analysis against job descriptions and skill weights
- automatic match scoring, shortlist/reject status updates, and recruiter review flows

---

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express
- PostgreSQL
- JWT authentication
- Multer for resume uploads
- `pdf-parse` for PDF text extraction

### AI Service

- FastAPI
- Pydantic
- pandas
- scikit-learn
- sentence-transformers
- fallback local skill-matching logic when the heavier pipeline is unavailable

---

## Project Structure

```text
skillsight-project/
├── README.md
├── backup.sql
├── Skillsight/
│   ├── frontend/
│   └── skillsight-backend/
└── Skillsight-AI/
```

### Important folders

```text
Skillsight/frontend/src/pages
Skillsight/skillsight-backend/src/controllers
Skillsight/skillsight-backend/src/routes
Skillsight/skillsight-backend/src/ml
Skillsight/skillsight-backend/src/uploads/resumes
Skillsight-AI/api_server.py
Skillsight-AI/pipeline
Skillsight-AI/data
```

---

## Core User Flows

### Student flow

1. Register and log in
2. Upload a resume PDF
3. Browse open jobs
4. Expand a job card to view the full description, requirements, and thresholds
5. Apply to a role
6. Track application status and AI feedback from the dashboard

### Recruiter flow

1. Register and log in as recruiter
2. Create jobs with:
   - title
   - description
   - skill weights
   - minimum match score
   - minimum experience
   - apply-by date
3. View only recruiter-owned jobs in the recruiter jobs page
4. Review candidates, open resumes, and update status
5. Use rankings and match scores to shortlist or reject applicants
6. See manual-review recommendations when candidates are tied for the same job on:
   - score
   - matched skills
   - experience

### AI analysis flow

1. Frontend sends job or resume actions to backend
2. Backend reads uploaded PDF and extracts text
3. Backend calls the FastAPI ML service at `/analyze-resume`
4. AI service returns:
   - `score`
   - `detected_skills`
   - `missing_skills`
   - `suggestions`
5. Backend stores analysis and auto-updates application status based on job thresholds

---

## Features

### Authentication

- JWT-based login
- role-aware session handling for students and recruiters
- persistent session in local storage

### Resume handling

- PDF upload via Multer
- files stored under:
  - `Skillsight/skillsight-backend/src/uploads/resumes`
- resume files served from:
  - `/api/uploads/resumes/<filename>`

### Job management

- JSON skill weights stored as JSONB
- recruiter-owned jobs page
- job delete support
- apply-by date support
- expired jobs automatically show as closed

### Candidate evaluation

- AI resume parsing
- threshold-based shortlist/reject automation
- candidate ranking
- recruiter feedback
- manual review recommendations for real tie cases

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/sirohideepanshu/skillsight-ai-resume-analyzer.git
cd skillsight-ai-resume-analyzer
```

### 2. Start PostgreSQL

Make sure a local PostgreSQL instance is running and a database exists for the app.

If you use a local database, the backend is already configured to disable SSL outside production.

---

## Backend Setup

Path:

```bash
cd Skillsight/skillsight-backend
```

Install dependencies:

```bash
npm install
```

Create `.env`:

```env
PORT=5050
JWT_SECRET=your_jwt_secret

# Use either DATABASE_URL...
DATABASE_URL=postgresql://username:password@localhost:5432/skillsight

# ...or DB_* variables
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=skillsight

ML_API_URL=http://127.0.0.1:8000/analyze-resume
BASE_URL=http://localhost:5050
NODE_ENV=development
```

Run backend:

```bash
npm run dev
```

If `nodemon` hits a watch-limit issue locally, you can run:

```bash
node src/server.js
```

Backend runs on:

```text
http://localhost:5050
```

---

## Frontend Setup

Path:

```bash
cd Skillsight/frontend
```

Install dependencies:

```bash
npm install
```

Optional `.env`:

```env
VITE_API_URL=http://localhost:5050/api
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## AI Service Setup

Path:

```bash
cd Skillsight-AI
```

Create virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the AI server:

```bash
uvicorn api_server:app --reload --port 8000
```

The repository also supports:

```bash
uvicorn main:app --reload --port 8000
```

because `main.py` now re-exports the real FastAPI app from `api_server.py`.

AI service runs on:

```text
http://127.0.0.1:8000
```

---

## How to Run the Full Project

Use three terminals.

### Terminal 1: AI service

```bash
cd Skillsight-AI
source .venv/bin/activate
uvicorn api_server:app --reload --port 8000
```

### Terminal 2: backend

```bash
cd Skillsight/skillsight-backend
npm run dev
```

### Terminal 3: frontend

```bash
cd Skillsight/frontend
npm run dev
```

Then open:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5050
AI API:   http://127.0.0.1:8000
```

---

## Main API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Jobs

- `GET /api/jobs`
- `POST /api/jobs`
- `DELETE /api/jobs/:id`

### Resumes

- `POST /api/resumes/upload`
- `GET /api/resumes/my-resume`

### Applications

- `GET /api/applications`
- `POST /api/applications`
- `PATCH /api/applications/:id`

### Recruiter dashboard / ranking

- `GET /api/dashboard/stats`
- `GET /api/dashboard/recent-applications`
- `GET /api/dashboard/ranking-candidates`
- `GET /api/candidates/ranking`
- `GET /api/jobs/:jobId/candidates`

### AI service

- `GET /`
- `POST /analyze-resume`

---

## Resume Analysis Response Shape

Typical response from the AI service:

```json
{
  "score": 84,
  "detected_skills": ["react", "node.js", "postgresql"],
  "missing_skills": ["docker", "aws"],
  "suggestions": ["Learn docker", "Learn aws"]
}
```

The backend uses this response to:

- store candidate analysis
- compute shortlist/reject status
- show recruiter ranking data
- show student-facing AI feedback

---

## Database Notes

The backend auto-applies a few compatibility columns during startup, including fields for:

- application status
- rejection feedback
- `user_id` on applications
- resume URL
- job thresholds
- job apply-by date
- soft-delete flag
- user experience years

Skill weights are stored in PostgreSQL as `JSONB`.

---

## Upload and File Serving Notes

- resumes are uploaded with field name: `resume`
- backend serves uploaded files from:
  - `/api/uploads`
- stored resume URLs look like:
  - `/api/uploads/resumes/<filename>`

If a resume opens in the browser, file serving is working correctly.

---

## Troubleshooting

### `The server does not support SSL connections`

Use local PostgreSQL without SSL and enable SSL only in production. This is already handled in:

- `Skillsight/skillsight-backend/src/config/db.js`

### `database "<username>" does not exist`

Your `DATABASE_URL` may be missing. Set either:

- `DATABASE_URL`

or all of:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

### `Cannot GET /api/uploads/resumes/...`

Check:

- backend static file serving is active
- the file exists under `src/uploads/resumes`

### `Attribute "app" not found in module "main"`

Use:

```bash
uvicorn api_server:app --reload --port 8000
```

or the updated:

```bash
uvicorn main:app --reload --port 8000
```

### `ModuleNotFoundError: No module named 'fastapi'`

Install AI service dependencies:

```bash
pip install -r requirements.txt
```

### Job applies but ranking stays pending

Check:

- AI service is running
- backend `.env` has `ML_API_URL=http://127.0.0.1:8000/analyze-resume`
- resume file exists and can be parsed

---

## Current Repository Notes

- root Git repository contains both the app and AI service
- `backup.sql` is included for database backup/reference
- there is also a frontend-specific README inside:
  - `Skillsight/frontend/README.md`

This root README is the main project-level reference.

---

## Recommended Next Improvements

- add a root `.env.example` for backend and frontend
- add database schema migration files for all auto-created columns
- add backend tests for auth, jobs, and applications
- add AI-service health check and smoke test script
- add deployment instructions for frontend, backend, database, and AI service

