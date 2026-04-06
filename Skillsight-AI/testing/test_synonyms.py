import sys
import os

# add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from pipeline.preprocess import normalize_text

text = "ML engineer using JS and K8s"

normalized = normalize_text(text)

print("Original:", text)
print("Normalized:", normalized)