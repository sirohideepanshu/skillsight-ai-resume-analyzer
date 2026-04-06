import os
import re


def extract_resume_str(text):

    # extract text after "Resume_str"
    match = re.search(r"Resume_str\s+(.*)", text)

    if match:
        return match.group(1)

    return text


def load_all_resumes(folder):

    resumes = []

    for file in os.listdir(folder):

        if file.endswith(".txt"):

            path = os.path.join(folder, file)

            with open(path, "r", encoding="utf-8") as f:
                raw = f.read()

            resume_text = extract_resume_str(raw)

            resumes.append({
                "file": file,
                "text": resume_text
            })

    return resumes