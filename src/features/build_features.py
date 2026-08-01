from pathlib import Path
import pandas as pd

INPUT_FILE = Path("data/raw/ligue1_history.csv")
OUTPUT_FILE = Path("data/processed/ligue1_features.csv")

df = pd.read_csv(INPUT_FILE)

df["Date"] = pd.to_datetime(df["Date"])

df["home_win"] = (df["FTR"] == "H").astype(int)
df["draw"] = (df["FTR"] == "D").astype(int)
df["away_win"] = (df["FTR"] == "A").astype(int)

df["goal_difference"] = df["FTHG"] - df["FTAG"]
df["total_goals"] = df["FTHG"] + df["FTAG"]

OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

df.to_csv(OUTPUT_FILE, index=False)

print("✅ Features créées")
print(df.head())
print(df.shape)