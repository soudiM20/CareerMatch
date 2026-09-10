# Usage: python test.py recommender.pkl "your query here"

import sys
import pickle
import pandas as pd

def recommend(pkl_path, query, top_k=5):
    with open(pkl_path, "rb") as f:
        pipeline = pickle.load(f)

    vectorizer = pipeline["vectorizer"]
    nn = pipeline["nn_model"]
    df = pipeline["dataframe"]

    vec = vectorizer.transform([query])
    distances, indices = nn.kneighbors(vec, n_neighbors=top_k)
    results = df.iloc[indices[0]].copy()
    results["score"] = 1 - distances[0]
    return results[["Internship_ID", "Company_Name", "Internship_Title", "Internship_State", "score"]]

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python test.py recommender.pkl 'your query here'")
    else:
        pkl_path = sys.argv[1]
        query = sys.argv[2]
        results = recommend(pkl_path, query, top_k=5)
        print("🔎 Query:", query)
        print(results.to_string(index=False))
