import pandas as pd
import os

TECH_RESUMES = "data/training_data/tech_resumes"
SKILLS_DATASET = "data/training_data/skills_resume_dataset/dataset.csv"
JOB_PAIRS = "data/training_data/resume_job_pairs/resume_jobs.csv"


print("\nChecking tech resumes")

files = os.listdir(TECH_RESUMES)
print("Total resumes:", len(files))

sample = open(os.path.join(TECH_RESUMES, files[0]), encoding="utf-8").read()[:300]
print("\nSample resume text:\n")
print(sample)


print("\nChecking skills dataset")

df = pd.read_csv(SKILLS_DATASET)
print("Rows:", len(df))
print(df.head())


print("\nChecking job pair dataset")

df2 = pd.read_csv(JOB_PAIRS)
print("Rows:", len(df2))
print(df2.head())