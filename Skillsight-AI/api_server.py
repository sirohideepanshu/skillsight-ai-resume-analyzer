from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np

# Import pipeline modules
from pipeline.preprocess import preprocess_text
from pipeline.skill_extractor import extract_skills
from pipeline.similarity_engine import compute_similarity
from pipeline.skill_gap_detector import detect_skill_gap
from pipeline.job_loader import load_jobs

# -----------------------------
# FastAPI App
# -----------------------------

app = FastAPI(title="SkillSight AI Engine")

# -----------------------------
# Request Schema
# -----------------------------

class ResumeInput(BaseModel):
    resume_text: str
    job_description: str | None = None


# -----------------------------
# Load Data Once at Startup
# -----------------------------

jobs_data = load_jobs("data/inference_data/job_descriptions/job_descriptions.csv")


# -----------------------------
# Utility: Clean NumPy Objects
# -----------------------------

def clean_response(data):

    if isinstance(data, dict):
        return {k: clean_response(v) for k, v in data.items()}

    if isinstance(data, list):
        return [clean_response(v) for v in data]

    if isinstance(data, np.ndarray):
        return data.tolist()

    if isinstance(data, (np.float32, np.float64)):
        return float(data)

    if isinstance(data, (np.int32, np.int64)):
        return int(data)

    return data


# -----------------------------
# Resume Analysis Endpoint
# -----------------------------

@app.post("/analyze-resume")
def analyze_resume(data: ResumeInput):

    text = data.resume_text.lower()

    # Step 1: preprocess
    tokens = preprocess_text(text)

    # Step 2: detect skills
    detected_skills = extract_skills(text)

    # Step 3: find best job match
    jobs = compute_similarity(text, jobs_data)

    best_job = jobs[0] if jobs else None

    matched_skills = []
    missing_skills = []

    if best_job:
        matched_skills, missing_skills = detect_skill_gap(detected_skills, best_job)

    # Step 4: candidate score
    total_required = len(matched_skills) + len(missing_skills)

    if total_required > 0:
        score = round((len(matched_skills) / total_required) * 100, 2)
    else:
        score = round(len(detected_skills) * 10,2)

    suggestions = []

    if missing_skills:
        suggestions = [f"Learn {skill}" for skill in missing_skills]

    response = {
    "message": "Resume analyzed successfully",
    "score": score,
    "detected_skills": detected_skills,
    "missing_skills": missing_skills,
    "suggestions": suggestions
}

    return clean_response(response)