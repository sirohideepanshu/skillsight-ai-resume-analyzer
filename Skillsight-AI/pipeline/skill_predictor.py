import joblib
import json

MODEL_PATH = "models/skill_classifier.pkl"
SKILLS_PATH = "data/skills/skills_database.json"

model = joblib.load(MODEL_PATH)

with open(SKILLS_PATH) as f:
    skill_list = json.load(f)

def predict_skills(text):

    prediction = model.predict([text])[0]

    detected_skills = []

    for i, value in enumerate(prediction):

        if value == 1:
            detected_skills.append(skill_list[i])

    return detected_skills