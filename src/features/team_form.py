import pandas as pd


df = pd.read_csv("data/processed/ligue1_features.csv")

df["Date"] = pd.to_datetime(df["Date"])
df = df.sort_values("Date").reset_index(drop=True)


team_history = {}

home_form = []
away_form = []

home_goals_scored = []
away_goals_scored = []

home_goals_conceded = []
away_goals_conceded = []

home_points_at_home_last5 = []
away_points_away_last5 = []


for _, match in df.iterrows():

    home = match["HomeTeam"]
    away = match["AwayTeam"]

    # Création de l'historique si l'équipe
    # n'a encore jamais joué
    if home not in team_history:
        team_history[home] = []

    if away not in team_history:
        team_history[away] = []


    # 5 derniers matchs toutes compétitions domicile/extérieur confondues
    home_last5 = team_history[home][-5:]
    away_last5 = team_history[away][-5:]


    # 5 derniers matchs de l'équipe à domicile
    home_home_matches = [
        game
        for game in team_history[home]
        if game["venue"] == "home"
    ][-5:]


    # 5 derniers matchs de l'équipe à l'extérieur
    away_away_matches = [
        game
        for game in team_history[away]
        if game["venue"] == "away"
    ][-5:]


    # Forme spécifique à domicile
    if len(home_home_matches) == 5:

        home_points_at_home_last5.append(
            sum(
                game["points"]
                for game in home_home_matches
            )
        )

    else:
        home_points_at_home_last5.append(None)


    # Forme spécifique à l'extérieur
    if len(away_away_matches) == 5:

        away_points_away_last5.append(
            sum(
                game["points"]
                for game in away_away_matches
            )
        )

    else:
        away_points_away_last5.append(None)


    # Forme générale équipe domicile
    if len(home_last5) == 5:

        home_form.append(
            sum(
                game["points"]
                for game in home_last5
            )
        )

        home_goals_scored.append(
            sum(
                game["goals_for"]
                for game in home_last5
            ) / 5
        )

        home_goals_conceded.append(
            sum(
                game["goals_against"]
                for game in home_last5
            ) / 5
        )

    else:

        home_form.append(None)
        home_goals_scored.append(None)
        home_goals_conceded.append(None)


    # Forme générale équipe extérieure
    if len(away_last5) == 5:

        away_form.append(
            sum(
                game["points"]
                for game in away_last5
            )
        )

        away_goals_scored.append(
            sum(
                game["goals_for"]
                for game in away_last5
            ) / 5
        )

        away_goals_conceded.append(
            sum(
                game["goals_against"]
                for game in away_last5
            ) / 5
        )

    else:

        away_form.append(None)
        away_goals_scored.append(None)
        away_goals_conceded.append(None)


    # Résultat du match actuel
    home_goals = match["FTHG"]
    away_goals = match["FTAG"]

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


    # On ajoute le match à l'historique
    # seulement APRÈS avoir calculé les features

    team_history[home].append({
        "points": home_points,
        "goals_for": home_goals,
        "goals_against": away_goals,
        "venue": "home",
    })


    team_history[away].append({
        "points": away_points,
        "goals_for": away_goals,
        "goals_against": home_goals,
        "venue": "away",
    })


# Ajout des nouvelles colonnes

df["home_form_last5"] = home_form
df["away_form_last5"] = away_form

df["home_goals_scored_last5"] = home_goals_scored
df["away_goals_scored_last5"] = away_goals_scored

df["home_goals_conceded_last5"] = home_goals_conceded
df["away_goals_conceded_last5"] = away_goals_conceded

df["home_points_at_home_last5"] = home_points_at_home_last5
df["away_points_away_last5"] = away_points_away_last5


# Sauvegarde

df.to_csv(
    "data/processed/ligue1_features.csv",
    index=False
)


print("✅ Features récentes calculées")

print(
    df[
        [
            "HomeTeam",
            "AwayTeam",
            "home_form_last5",
            "away_form_last5",
            "home_points_at_home_last5",
            "away_points_away_last5",
        ]
    ].tail()
)