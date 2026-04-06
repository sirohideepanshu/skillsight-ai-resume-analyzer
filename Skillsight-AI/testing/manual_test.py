import joblib
import json

MODEL_PATH = "models/skill_classifier.pkl"
SKILLS_FILE = "data/skills/skills_database.json"

model = joblib.load(MODEL_PATH)

with open(SKILLS_FILE) as f:
    skills = json.load(f)

sample = """
Developed REST APIs using Django and Flask.
Containerized application using Docker and deployed on AWS EC2.
Used PostgreSQL database and React frontend.
"""

prediction = model.predict([sample])[0]

detected_skills = []

for i, val in enumerate(prediction):
    if val == 1:
        detected_skills.append(skills[i])

print("\nDetected skills:")
for s in detected_skills:
    print("-", s)