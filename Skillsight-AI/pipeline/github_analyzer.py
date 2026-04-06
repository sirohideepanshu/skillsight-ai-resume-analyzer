import requests


def get_repositories(username):

    url = f"https://api.github.com/users/{username}/repos"

    response = requests.get(url)

    repos = response.json()

    return repos


def extract_languages(repos):

    languages = set()

    for repo in repos:

        if repo["language"]:
            languages.add(repo["language"].lower())

    return list(languages)

def verify_skills(candidate_skills, github_languages):

    verified = []
    missing = []

    for skill in candidate_skills:

        if skill.lower() in github_languages:
            verified.append(skill)
        else:
            missing.append(skill)

    return verified, missing