import json

# Load skills database once
with open("data/skills/skills_database.json") as f:
    SKILLS_DB = json.load(f)

def extract_skills(text):

    text = text.lower()
    detected = []

    for skill in SKILLS_DB:

        skill_lower = skill.lower()

        # Ignore single letter skills like "c"
        if len(skill_lower) == 1:
            continue

        if skill_lower in text:
            detected.append(skill_lower)

    return list(set(detected))