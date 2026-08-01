from pathlib import Path
from io import StringIO

import pandas as pd
import requests

SEASONS = {
    "2021-2022": "2122",
    "2022-2023": "2223",
    "2023-2024": "2324",
    "2024-2025": "2425",
    "2025-2026": "2526",
}

COLUMNS = [
    "Date",
    "HomeTeam",
    "AwayTeam",
    "FTHG",
    "FTAG",
    "FTR",
]

all_seasons = []

for season_name, season_code in SEASONS.items():
    url = f"https://www.football-data.co.uk/mmz4281/{season_code}/F1.csv"

    print(f"Téléchargement de {season_name}...")

    response = requests.get(url, timeout=20)
    response.raise_for_status()

    df = pd.read_csv(StringIO(response.text))
    df = df[COLUMNS].copy()

    df["Season"] = season_name
    all_seasons.append(df)

history = pd.concat(all_seasons, ignore_index=True)

history["Date"] = pd.to_datetime(
    history["Date"],
    dayfirst=True,
    errors="coerce"
)

history = history.dropna()

history["FTHG"] = history["FTHG"].astype(int)
history["FTAG"] = history["FTAG"].astype(int)

history = history.sort_values("Date").reset_index(drop=True)

output = Path("data/raw/ligue1_history.csv")

history.to_csv(output, index=False)

print("\n✅ Dataset créé")
print("Nombre de matchs :", len(history))
print("Nombre de colonnes :", history.shape[1])
print("\nPremiers matchs :")
print(history.head())