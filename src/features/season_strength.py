import pandas as pd


df = pd.read_csv("data/processed/ligue1_features.csv")

df["Date"] = pd.to_datetime(df["Date"])
df = df.sort_values("Date").reset_index(drop=True)


team_stats = {}

home_ppg_list = []
away_ppg_list = []


for _, match in df.iterrows():

    home = match["HomeTeam"]
    away = match["AwayTeam"]


    # Initialisation des équipes
    if home not in team_stats:
        team_stats[home] = {
            "points": 0,
            "matches": 0
        }

    if away not in team_stats:
        team_stats[away] = {
            "points": 0,
            "matches": 0
        }


    # =========================
    # PPG AVANT le match
    # =========================

    if team_stats[home]["matches"] > 0:

        home_ppg = (
            team_stats[home]["points"]
            / team_stats[home]["matches"]
        )

    else:
        home_ppg = None


    if team_stats[away]["matches"] > 0:

        away_ppg = (
            team_stats[away]["points"]
            / team_stats[away]["matches"]
        )

    else:
        away_ppg = None


    home_ppg_list.append(home_ppg)
    away_ppg_list.append(away_ppg)


    # =========================
    # Résultat du match
    # =========================

    result = match["FTR"]

    if result == "H":

        home_points = 3
        away_points = 0

    elif result == "D":

        home_points = 1
        away_points = 1

    else:

        home_points = 0
        away_points = 3


    # =========================
    # Mise à jour APRÈS le match
    # =========================

    team_stats[home]["points"] += home_points
    team_stats[home]["matches"] += 1

    team_stats[away]["points"] += away_points
    team_stats[away]["matches"] += 1


# =========================
# Ajouter les features
# =========================

df["home_ppg"] = home_ppg_list
df["away_ppg"] = away_ppg_list

df["ppg_diff"] = (
    df["home_ppg"]
    - df["away_ppg"]
)


df.to_csv(
    "data/processed/ligue1_features.csv",
    index=False
)


print("✅ Features PPG calculées")

print(
    df[
        [
            "HomeTeam",
            "AwayTeam",
            "home_ppg",
            "away_ppg",
            "ppg_diff",
            "FTR",
        ]
    ].tail(10)
)