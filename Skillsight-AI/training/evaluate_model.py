import os
import joblib
import numpy as np
from sklearn.metrics import f1_score


TECH_RESUME_FOLDER = "data/training_data/tech_resumes"
MODEL_PATH = "models/skill_classifier.pkl"


def load_resumes():

    texts = []

    for file in os.listdir(TECH_RESUME_FOLDER):

        if file.endswith(".txt"):

            path = os.path.join(TECH_RESUME_FOLDER, file)

            with open(path, encoding="utf-8") as f:
                texts.append(f.read())

    return texts


def main():

    print("\nLoading model...")
    model = joblib.load(MODEL_PATH)

    print("Loading resumes...")
    texts = load_resumes()

    print("Total resumes:", len(texts))

    print("\nPredicting skills...")

    y_pred = model.predict(texts)

    print("\nPrediction matrix shape:", y_pred.shape)

    total_predictions = np.sum(y_pred)

    print("Total predicted skill hits:", total_predictions)

    avg_skills = total_predictions / len(texts)

    print("Average skills per resume:", round(avg_skills, 2))

    print("\nEvaluation Complete")


if __name__ == "__main__":
    main()