import json

skills = [

# Programming Languages
"python","java","c","c++","c#","javascript","typescript","go","rust","kotlin","swift",

# Web Development
"html","css","sass","react","angular","vue","nextjs","nodejs","express","django","flask","fastapi","spring","spring boot",

# Databases
"mysql","postgresql","mongodb","redis","sqlite","oracle","dynamodb","cassandra","snowflake",

# DevOps
"docker","kubernetes","terraform","ansible","jenkins","gitlab ci","github actions","ci/cd",

# Cloud
"aws","azure","gcp","aws ec2","aws s3","aws lambda","cloud functions",

# Data Engineering
"hadoop","spark","kafka","airflow","etl","data pipeline",

# Machine Learning
"machine learning","deep learning","nlp","computer vision","tensorflow","pytorch","scikit-learn","xgboost",

# Data Analysis
"pandas","numpy","matplotlib","seaborn","tableau","power bi",

# Backend
"rest api","graphql","microservices","grpc",

# Security
"cybersecurity","penetration testing","network security","encryption","oauth",

# Mobile
"android","ios","flutter","react native",

# AI tools
"langchain","openai api","huggingface","llm","transformers"

]

with open("data/skills/skills_database.json","w") as f:
    json.dump(skills,f,indent=2)

print("Skill database created with",len(skills),"skills")