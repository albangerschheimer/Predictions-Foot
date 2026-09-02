import os
from pathlib import Path

import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv(override=True)

TOKEN = os.getenv("FOOTBALL_DATA_TOKEN")
BASE_URL = os.getenv("FOOTBALL_DATA_BASE_URL") or os.getenv("BASE_URL")

if not TOKEN:
    raise RuntimeError("FOOTBALL_DATA_TOKEN est absent du fichier .env")

if not BASE_URL:
    raise RuntimeError(
        "FOOTBALL_DATA_BASE_URL (ou BASE_URL) est absent du fichier .env"
    )

url = f"{BASE_URL}/competitions/FL1/matches"

headers = {
    "X-Auth-Token": TOKEN.strip()
}

print("Récupération des matchs de Ligue 1...\n")

try:
    response = requests.get(
        url,
        headers=headers,
        timeout=30
    )

    print(f"Code HTTP : {response.status_code}")
    response.raise_for_status()

    data = response.json()
    matches = data.get("matches", [])

    rows = []

    for match in matches:
        score = match.get("score", {}).get("fullTime", {})

        rows.append({
            "match_id": match.get("id"),
            "date_utc": match.get("utcDate"),
            "status": match.get("status"),
            "matchday": match.get("matchday"),
            "stage": match.get("stage"),
            "home_team_id": match.get("homeTeam", {}).get("id"),
            "home_team": match.get("homeTeam", {}).get("name"),
            "away_team_id": match.get("awayTeam", {}).get("id"),
            "away_team": match.get("awayTeam", {}).get("name"),
            "home_score": score.get("home"),
            "away_score": score.get("away"),
            "winner": match.get("score", {}).get("winner"),
        })

    dataframe = pd.DataFrame(rows)

    output_directory = Path("data/processed")
    output_directory.mkdir(parents=True, exist_ok=True)

    output_file = output_directory / "ligue1_matches.csv"
    dataframe.to_csv(output_file, index=False)

    print(f"\nNombre de matchs récupérés : {len(dataframe)}")
    print(f"Fichier enregistré : {output_file}")

    if not dataframe.empty:
        print("\nAperçu des 5 premiers matchs :")
        print(
            dataframe[
                [
                    "date_utc",
                    "home_team",
                    "away_team",
                    "home_score",
                    "away_score",
                    "status",
                ]
            ].head()
        )

except requests.exceptions.RequestException as error:
    print(f"\nErreur HTTP : {error}")

    if "response" in locals():
        print("Réponse complète de l'API :")
        print(response.text)