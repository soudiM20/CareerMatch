# Usage: python train.py internship.csv recommender.pkl
#
# Standalone offline experimentation script — NOT used by app.py.
#
# Fix (train/inference consistency audit): app.py fits its own TF-IDF index
# from internship.csv at Flask startup (see load_pipeline() in app.py) and
# never loads recommender.pkl or anything produced here. That is the actual,
# deliberate architecture for this project's scale: a single-process Flask
# service that always serves from the current CSV, so there is no
# train → serialize → load step to keep in sync with data changes.
#
# This script (and test.py, which loads its .pkl output) exists only for
# offline experimentation with a k-NN-based alternative to app.py's direct
# cosine-similarity ranking. Its preprocessing is intentionally kept
# identical to app.py's load_pipeline() (same text columns, same TF-IDF
# config) so that if it is ever promoted to power inference, there is a
# single preprocessing definition to reconcile — not two that have quietly
# drifted apart. If you change app.py's text_cols or vectorizer settings,
# update this list to match.

import sys
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors

def train(input_csv, output_pkl):
    # Load dataset
    df = pd.read_csv(input_csv)

    # Select text columns — kept identical to app.py's load_pipeline() fields.
    possible_text_cols = [
        "Internship_Title", "Company_Name", "Sector", "Area_Field",
        "Required_Skills", "Eligibility_Education", "Benefits", "Company_Description"
    ]
    text_cols = [c for c in possible_text_cols if c in df.columns]
    df[text_cols] = df[text_cols].fillna("")

    # Combine text columns
    df["combined_text"] = df[text_cols].agg(" ".join, axis=1)

    # TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(
        max_features=20000,
        stop_words="english",
        ngram_range=(1,2)
    )
    X = vectorizer.fit_transform(df["combined_text"])

    # Nearest Neighbors
    nn = NearestNeighbors(n_neighbors=10, metric="cosine", algorithm="brute")
    nn.fit(X)

    # Save pipeline
    pipeline = {
        "vectorizer": vectorizer,
        "nn_model": nn,
        "dataframe": df.reset_index(drop=True),
        "text_column": "combined_text",
        "tfidf_matrix": X   # <--- Added here
    }

    with open(output_pkl, "wb") as f:
        pickle.dump(pipeline, f)

    print(f"✅ Model trained and saved to {output_pkl}")

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        train(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python train.py internship.csv recommender.pkl")
