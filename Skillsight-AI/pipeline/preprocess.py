import nltk
import string
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import json

with open("data/skills/skill_synonyms.json") as f:
    SYNONYMS = json.load(f)

def normalize_text(text):

    text = text.lower()

    for short,full in SYNONYMS.items():
        text = text.replace(short,full)

    return text


stop_words = set(stopwords.words("english"))

lemmatizer = WordNetLemmatizer()


def preprocess_text(text):

    # lowercase
    text = text.lower()

    # tokenize
    tokens = word_tokenize(text)

    clean_tokens = []

    for word in tokens:

        if word not in stop_words and word not in string.punctuation:

            lemma = lemmatizer.lemmatize(word)

            clean_tokens.append(lemma)

    return clean_tokens