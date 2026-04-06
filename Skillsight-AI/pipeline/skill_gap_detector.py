from pipeline.skill_extractor import extract_skills

def detect_skill_gap(resume_skills, job):

    job_text = ""

    # handle different job formats safely
    if "text" in job:
        job_text = job["text"].lower()
    elif "description" in job:
        job_text = job["description"].lower()

    # extract job skills
    job_skills = extract_skills(job_text)

    matched_skills = []
    missing_skills = []

    for skill in job_skills:

        if skill in resume_skills:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    return matched_skills, missing_skills