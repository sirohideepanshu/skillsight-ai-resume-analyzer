import os
import json
import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.multioutput import MultiOutputClassifier


TECH_RESUME_FOLDER = "data/training_data/tech_resumes"
SKILLS_FILE = "data/skills/skills_database.json"
MODEL_PATH = "models/skill_classifier.pkl"


def load_resumes():

    texts = []

    for file in os.listdir(TECH_RESUME_FOLDER):

        if file.endswith(".txt"):

            path = os.path.join(TECH_RESUME_FOLDER, file)

            with open(path, encoding="utf-8") as f:
                texts.append(f.read())

    return texts


def load_skills():

    with open(SKILLS_FILE) as f:
        skills = json.load(f)

    return skills


def generate_labels(texts, skills):

    labels = []

    for text in texts:

        text = text.lower()

        row = []

        for skill in skills:

            row.append(1 if skill in text else 0)

        labels.append(row)

    df = pd.DataFrame(labels, columns=skills)

    return df


def filter_skills(y):

    valid = []

    for col in y.columns:

        if len(y[col].unique()) > 1:
            valid.append(col)

    return y[valid]


def train():

    print("\nLoading resumes...")
    texts = load_resumes()
    print("Resumes loaded:", len(texts))

    print("\nLoading skills...")
    skills = load_skills()
    print("Skills:", len(skills))

    print("\nGenerating labels...")
    y = generate_labels(texts, skills)

    print("\nFiltering invalid skills...")
    y = filter_skills(y)

    print("Remaining skills:", y.shape[1])

    if y.shape[1] == 0:
        print("No valid skills found in dataset")
        return

    print("\nTraining model...")

    model = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=8000)),
        ("clf", MultiOutputClassifier(LogisticRegression(max_iter=1000)))
    ])

    model.fit(texts, y)

    os.makedirs("models", exist_ok=True)

    joblib.dump(model, MODEL_PATH)

    print("\nModel saved at:", MODEL_PATH)


if __name__ == "__main__":
    train()