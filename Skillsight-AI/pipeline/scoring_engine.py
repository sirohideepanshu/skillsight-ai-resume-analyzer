import json


def load_skill_weights(path):

    with open(path, "r") as f:
        weights = json.load(f)

    return weights


def compute_candidate_score(candidate_skills, weights):

    total_weight = sum(weights.values())

    obtained_weight = 0

    for skill in candidate_skills:

        if skill in weights:
            obtained_weight += weights[skill]

    if total_weight == 0:
        return 0

    score = obtained_weight / total_weight

    return round(score * 100, 2)