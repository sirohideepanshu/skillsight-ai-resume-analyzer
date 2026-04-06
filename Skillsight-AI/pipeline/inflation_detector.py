from collections import Counter


def detect_skill_inflation(tokens, skills_db):

    token_counts = Counter(tokens)

    inflation_flags = {}

    for skill in skills_db:

        skill_tokens = skill.split()

        if len(skill_tokens) == 1:

            count = token_counts[skill_tokens[0]]

        else:

            count = sum(token_counts[token] for token in skill_tokens)

        if count > 5:

            inflation_flags[skill] = {
                "count": count,
                "flag": True
            }

    return inflation_flags