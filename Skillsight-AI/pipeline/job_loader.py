import pandas as pd


def load_jobs(path):

    df = pd.read_csv(path)

    jobs = []

    for _, row in df.iterrows():

        job_text = str(row["Title"]) + " " + \
                   str(row["Skills"]) + " " + \
                   str(row["Keywords"])

        jobs.append({
            "id": row["JobID"],
            "title": row["Title"],
            "text": job_text
        })

    return jobs