import pandas as pd


df = pd.read_csv("data/processed/ligue1_features.csv")

df["Date"] = pd.to_datetime(df["Date"])
df = df.sort_values("Date").reset_index(drop=True)


ratings = {}

home_elo = []
away_elo = []


K = 20
START_ELO = 1500


def expected_score(rating_a, rating_b):
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))


for _, match in df.iterrows():

    home = match["HomeTeam"]
    away = match["AwayTeam"]

    if home not in ratings:
        ratings[home] = START_ELO

    if away not in ratings:
        ratings[away] = START_ELO


    home_rating = ratings[home]
    away_rating = ratings[away]


    # Elo AVANT le match
    home_elo.append(home_rating)
    away_elo.append(away_rating)


    expected_home = expected_score(
        home_rating + 100,
        away_rating
    )

    expected_away = 1 - expected_home


    result = match["FTR"]

    if result == "H":
        actual_home = 1
        actual_away = 0

    elif result == "D":
        actual_home = 0.5
        actual_away = 0.5

    else:
        actual_home = 0
        actual_away = 1


    ratings[home] = (
        home_rating
        + K * (actual_home - expected_home)
    )

    ratings[away] = (
        away_rating
        + K * (actual_away - expected_away)
    )


df["home_elo"] = home_elo
df["away_elo"] = away_elo

df["elo_diff"] = (
    df["home_elo"] - df["away_elo"]
)


df.to_csv(
    "data/processed/ligue1_features.csv",
    index=False
)
print(" Elo calculé")

print(
    df[
        [
            "HomeTeam",
            "AwayTeam",
            "home_elo",
            "away_elo",
            "elo_diff",
            "FTR",
        ]
    ].tail()
)
