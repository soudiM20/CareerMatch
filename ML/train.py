# Usage: python train.py internship.csv recommender.pkl
# Optional offline training utility. The Flask API currently builds its TF-IDF index from internship.csv at startup.

import sys
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors

def train(input_csv, output_pkl):
    # Load dataset
    df = pd.read_csv(input_csv)

    # Select text columns
    possible_text_cols = [
        "Internship_Title", "Company_Name", "Sector", "Area_Field",
        "Internship_State", "Internship_District", "Required_Skills",
        "Company_Description", "Eligibility_Description", "Benefits"
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
