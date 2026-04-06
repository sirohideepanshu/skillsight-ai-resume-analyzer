import re
from typing import Dict, List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from pipeline.preprocess import preprocess_text
from pipeline.skill_extractor import extract_skills
from pipeline.scoring_engine import compute_candidate_score


app = FastAPI(title="SkillSight ML API")

SKILL_ALIASES = {
    "ml": "machine learning",
    "dl": "deep learning",
    "nlp": "natural language processing",
    "cv": "computer vision",
    "ai": "artificial intelligence",
}


class ResumeRequest(BaseModel):
    resume_text: str
    job_description: str
    skill_weights: Dict[str, float] = Field(default_factory=dict)


def normalize_for_matching(text: str) -> str:
    tokens = preprocess_text(text or "")
    return " ".join(tokens)


def normalize_weights(weights: Dict[str, float]) -> Dict[str, float]:
    normalized = {}

    for skill, value in (weights or {}).items():
        try:
            normalized[str(skill).strip().lower()] = float(value)
        except (TypeError, ValueError):
            continue

    return normalized


def expand_skill_aliases(text: str) -> str:
    normalized = f" {(text or '').lower()} "

    for alias, canonical in SKILL_ALIASES.items():
        normalized = normalized.replace(f" {alias} ", f" {canonical} ")

    return normalized.strip()


def derive_required_skills(job_description: str, weights: Dict[str, float]):
    required_skills = []
    seen = set()

    for skill in weights.keys():
        if skill not in seen:
            required_skills.append(skill)
            seen.add(skill)

    for skill in extract_skills(job_description):
        if skill not in seen:
            required_skills.append(skill)
            seen.add(skill)

    return required_skills


def extract_project_section(text: str) -> str:
    lines = [line.strip() for line in (text or "").splitlines()]
    capture = False
    project_lines: List[str] = []

    for line in lines:
        normalized = line.lower().strip(": ")
        is_heading = normalized in {
            "projects",
            "project",
            "academic projects",
            "personal projects",
            "project experience",
        }

        if is_heading:
            capture = True
            continue

        if capture and normalized in {
            "experience",
            "work experience",
            "education",
            "skills",
            "certifications",
            "achievements",
            "summary",
        }:
            break

        if capture and line:
            project_lines.append(line)

    if project_lines:
        return "\n".join(project_lines)

    project_matches = re.findall(
        r"(?:project|built|developed|implemented|created)\b.{0,220}",
        text or "",
        flags=re.IGNORECASE,
    )
    return "\n".join(project_matches)


def compute_weighted_score_with_project_evidence(
    required_skills: List[str],
    matched_skills: List[str],
    evidenced_skills: List[str],
    weights: Dict[str, float],
) -> float:
    if weights:
        total_weight = sum(weights.get(skill, 0.0) for skill in required_skills)
        if total_weight <= 0:
            return 0.0

        obtained_weight = 0.0
        for skill in required_skills:
            weight = weights.get(skill, 0.0)
            if skill in evidenced_skills:
                obtained_weight += weight
            elif skill in matched_skills:
                obtained_weight += weight * 0.35

        return round((obtained_weight / total_weight) * 100, 2)

    total_required = len(required_skills)
    if total_required == 0:
        return 0.0

    obtained = 0.0
    for skill in required_skills:
        if skill in evidenced_skills:
            obtained += 1.0
        elif skill in matched_skills:
            obtained += 0.35

    return round((obtained / total_required) * 100, 2)


@app.get("/")
def root():
    return {"status": "SkillSight ML API running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze-resume")
def analyze_resume(data: ResumeRequest):
    resume_text = expand_skill_aliases((data.resume_text or "").strip())
    job_description = expand_skill_aliases((data.job_description or "").strip())

    if not resume_text:
        raise HTTPException(status_code=400, detail="resume_text is required")

    if not job_description:
        raise HTTPException(status_code=400, detail="job_description is required")

    normalized_resume = normalize_for_matching(resume_text)
    normalized_job = normalize_for_matching(job_description)
    normalized_projects = normalize_for_matching(extract_project_section(resume_text))

    weights = normalize_weights(data.skill_weights)
    detected_skills = extract_skills(normalized_resume)
    project_skills = extract_skills(normalized_projects)
    required_skills = derive_required_skills(normalized_job, weights)
    matched_skills = [skill for skill in required_skills if skill in detected_skills]
    missing_skills = [skill for skill in required_skills if skill not in detected_skills]
    evidenced_skills = [skill for skill in matched_skills if skill in project_skills]
    skills_not_used_in_projects = [skill for skill in matched_skills if skill not in project_skills]

    if required_skills:
        score = compute_weighted_score_with_project_evidence(
            required_skills=required_skills,
            matched_skills=matched_skills,
            evidenced_skills=evidenced_skills,
            weights=weights,
        )
    elif weights:
        score = compute_candidate_score(detected_skills, weights)
    else:
        score = round(min(len(detected_skills) * 10, 100), 2)

    suggestions = []
    if missing_skills:
        suggestions.append("Candidate does not have the same skillset as required for this role.")
        suggestions.append(f"Missing skills: {', '.join(missing_skills[:5])}")
    if skills_not_used_in_projects:
        suggestions.append(
            f"Skills mentioned in the resume but not evidenced in projects: {', '.join(skills_not_used_in_projects[:5])}"
        )
    if not suggestions:
        suggestions = ["Strong overlap with the current role requirements"]

    return {
        "score": score,
        "detected_skills": detected_skills,
        "project_skills": project_skills,
        "matched_skills": matched_skills,
        "project_evidence_skills": evidenced_skills,
        "skills_not_used_in_projects": skills_not_used_in_projects,
        "missing_skills": missing_skills,
        "suggestions": suggestions,
    }
