def generate_recommendations(missing_skills):

    suggestions = []

    learning_map = {

        "docker": "Learn Docker and containerize a project",

        "kubernetes": "Study container orchestration and deploy microservices",

        "aws": "Deploy a project on AWS EC2 or S3",

        "tensorflow": "Build a deep learning model using TensorFlow",

        "pytorch": "Train a neural network using PyTorch",

        "react": "Build a frontend web app using React",

        "nodejs": "Develop a backend API using Node.js",

        "machine learning": "Implement ML models using scikit-learn"

    }

    for skill in missing_skills:

        if skill in learning_map:

            suggestions.append(learning_map[skill])

    return suggestions