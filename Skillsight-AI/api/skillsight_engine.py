from pipeline.resume_loader import load_resume_text
from pipeline.skill_predictor import predict_skills
from pipeline.similarity_engine import compute_similarity
from pipeline.skill_gap_detector import detect_skill_gap


def analyze_resume(resume_text):

    skills = predict_skills(resume_text)

    jobs = compute_similarity(resume_text)

    best_job = jobs[0]

    required, missing = detect_skill_gap(skills, best_job)

    return {
        "detected_skills": skills,
        "top_job_match": best_job,
        "missing_skills": missing
    }