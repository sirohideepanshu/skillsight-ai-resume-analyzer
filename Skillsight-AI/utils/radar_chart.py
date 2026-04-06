import matplotlib.pyplot as plt
import numpy as np


def generate_radar_chart(candidate_skills, weights):

    labels = list(weights.keys())

    scores = []

    for skill in labels:

        if skill in candidate_skills:
            scores.append(weights[skill])
        else:
            scores.append(0)

    values = np.array(scores)

    angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False)

    values = np.concatenate((values, [values[0]]))
    angles = np.concatenate((angles, [angles[0]]))

    fig = plt.figure()
    ax = fig.add_subplot(111, polar=True)

    ax.plot(angles, values)
    ax.fill(angles, values, alpha=0.25)

    ax.set_thetagrids(angles[:-1] * 180/np.pi, labels)

    plt.title("Candidate Skill Profile")

    plt.show()