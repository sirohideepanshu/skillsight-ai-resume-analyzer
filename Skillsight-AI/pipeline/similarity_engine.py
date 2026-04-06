from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer("all-MiniLM-L6-v2")


def compute_similarity(resume_text, jobs):

    resume_embedding = model.encode(resume_text)

    results = []

    for job in jobs:

        job_embedding = model.encode(job["text"])

        score = cosine_similarity(
            [resume_embedding],
            [job_embedding]
        )[0][0]

        results.append({
            "job": job,
            "job_title": job["title"],
            "score": score
        })

    results.sort(key=lambda x: x["score"], reverse=True)

    unique_titles = set()
    filtered_results = []

    for r in results:

        if r["job_title"] not in unique_titles:

            unique_titles.add(r["job_title"])
            filtered_results.append(r)

    return filtered_results[:3]

    filtered = [r for r in results if r["score"] > 0.5]

    if len(filtered) == 0:
        return results[:3]
    
    

    return filtered[:3]