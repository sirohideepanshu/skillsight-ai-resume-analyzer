import pandas as pd

from pipeline.similarity_engine import compute_similarity

JOB_FILE = "data/inference_data/job_descriptions/job_descriptions.csv"

print("Loading job descriptions...")

jobs_df = pd.read_csv(JOB_FILE)

jobs = []

for _, row in jobs_df.iterrows():

    jobs.append({
        "job_title": row["job_title"],
        "text": row["job_description"]
    })


sample_resume = """
Python developer with experience in Django, Docker and AWS.
Built REST APIs and deployed microservices.
Used PostgreSQL database and React frontend.
"""

print("\nRunning similarity search...\n")

results = compute_similarity(sample_resume, jobs)

print("Top Job Matches:\n")

for r in results[:5]:
    print(r["job_title"], "→ similarity:", round(r["similarity"], 3))