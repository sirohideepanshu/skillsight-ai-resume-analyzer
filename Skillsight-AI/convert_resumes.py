import os
import json

INPUT_FOLDER = "data/tech_resumes"
OUTPUT_FOLDER = "data/resumes/text"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

count = 0

for file in os.listdir(INPUT_FOLDER):
    if file.endswith(".jsonl"):
        path = os.path.join(INPUT_FOLDER, file)

        with open(path, "r") as f:
            for line in f:
                data = json.loads(line)

                text = str(data)

                with open(f"{OUTPUT_FOLDER}/resume_{count}.txt", "w") as out:
                    out.write(text)

                count += 1

print("Converted", count, "resumes to text files.")