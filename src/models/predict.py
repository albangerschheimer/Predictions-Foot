"""Reusable match prediction helpers.

The trained model and its input data are loaded once, then shared by the CLI
and the web API. No feature calculation performed during training is changed
here; this module only packages the existing inference flow into functions.
"""

from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = PROJECT_ROOT / "models" / "football_model.pkl"
FEATURES_PATH = PROJECT_ROOT / "models" / "features.pkl"
DATA_PATH = PROJECT_ROOT / "data" / "processed" / "ligue1_features.csv"


class UnknownTeamError(ValueError):
    """Raised when a team is absent from the feature dataset."""


@lru_cache(maxsize=1)
def _load_assets() -> tuple[Any, list[str], pd.DataFrame]:
    """Load the persisted inference assets once per Python process."""

    model = joblib.load(MODEL_PATH)
    features = joblib.load(FEATURES_PATH)
    dataframe = pd.read_csv(DATA_PATH)
    return model, features, dataframe


def get_available_teams(*, current_season_only: bool = True) -> list[str]:
    """Return known teams, restricted to the latest season by default."""

    _, _, dataframe = _load_assets()
    source = dataframe

    if current_season_only and "Season" in dataframe.columns:
        seasons = dataframe["Season"].dropna()
        if not seasons.empty:
            source = dataframe[dataframe["Season"] == seasons.iloc[-1]]

    teams = set(source["HomeTeam"].dropna()) | set(source["AwayTeam"].dropna())
    return sorted(teams)


def _latest_team_row(dataframe: pd.DataFrame, team: str) -> pd.Series:
    matches = dataframe[
        (dataframe["HomeTeam"] == team) | (dataframe["AwayTeam"] == team)
    ]

    if matches.empty:
        raise UnknownTeamError(f"Unknown team: {team}")

    return matches.iloc[-1]


def _value_for_team(row: pd.Series, team: str, home_column: str, away_column: str) -> float:
    column = home_column if row["HomeTeam"] == team else away_column
    return float(row[column])


def _build_match_features(home_team: str, away_team: str) -> pd.DataFrame:
    """Recreate the exact feature row used by the original prediction script."""

    _, features, dataframe = _load_assets()
    home_last = _latest_team_row(dataframe, home_team)
    away_last = _latest_team_row(dataframe, away_team)

    home_form = _value_for_team(
        home_last, home_team, "home_form_last5", "away_form_last5"
    )
    away_form = _value_for_team(
        away_last, away_team, "home_form_last5", "away_form_last5"
    )
    home_scored = _value_for_team(
        home_last,
        home_team,
        "home_goals_scored_last5",
        "away_goals_scored_last5",
    )
    away_scored = _value_for_team(
        away_last,
        away_team,
        "home_goals_scored_last5",
        "away_goals_scored_last5",
    )
    home_conceded = _value_for_team(
        home_last,
        home_team,
        "home_goals_conceded_last5",
        "away_goals_conceded_last5",
    )
    away_conceded = _value_for_team(
        away_last,
        away_team,
        "home_goals_conceded_last5",
        "away_goals_conceded_last5",
    )
    home_elo = _value_for_team(home_last, home_team, "home_elo", "away_elo")
    away_elo = _value_for_team(away_last, away_team, "home_elo", "away_elo")
    home_ppg = _value_for_team(home_last, home_team, "home_ppg", "away_ppg")
    away_ppg = _value_for_team(away_last, away_team, "home_ppg", "away_ppg")

    match = pd.DataFrame(
        [
            {
                "home_form_last5": home_form,
                "away_form_last5": away_form,
                "home_goals_scored_last5": home_scored,
                "away_goals_scored_last5": away_scored,
                "home_goals_conceded_last5": home_conceded,
                "away_goals_conceded_last5": away_conceded,
                "form_diff": home_form - away_form,
                "attack_diff": home_scored - away_scored,
                "defense_diff": away_conceded - home_conceded,
                "home_attack_vs_away_defense": home_scored - away_conceded,
                "away_attack_vs_home_defense": away_scored - home_conceded,
                "home_elo": home_elo,
                "away_elo": away_elo,
                "elo_diff": home_elo - away_elo,
                "home_ppg": home_ppg,
                "away_ppg": away_ppg,
                "ppg_diff": home_ppg - away_ppg,
            }
        ]
    )

    return match[features]


def predict_match(home_team: str, away_team: str) -> dict[str, Any]:
    """Predict a fixture and return JSON-serializable probabilities.

    Probabilities are decimal values between 0 and 1. The stable keys
    ``home``, ``draw`` and ``away`` avoid exposing scikit-learn's class order
    to API consumers.
    """

    home_team = home_team.strip()
    away_team = away_team.strip()

    if not home_team or not away_team:
        raise ValueError("Both teams are required.")
    if home_team == away_team:
        raise ValueError("Choose two different teams.")

    model, _, _ = _load_assets()
    match = _build_match_features(home_team, away_team)
    class_probabilities = {
        str(result): float(probability)
        for result, probability in zip(model.classes_, model.predict_proba(match)[0])
    }
    prediction_class = str(model.predict(match)[0])

    labels = {"H": home_team, "D": "Draw", "A": away_team}

    return {
        "home_team": home_team,
        "away_team": away_team,
        "probabilities": {
            "home": class_probabilities["H"],
            "draw": class_probabilities["D"],
            "away": class_probabilities["A"],
        },
        "prediction": {
            "class": prediction_class,
            "label": labels[prediction_class],
        },
    }


def _print_prediction(result: dict[str, Any]) -> None:
    home_team = result["home_team"]
    away_team = result["away_team"]
    probabilities = result["probabilities"]

    print(f"\n⚽ {home_team} vs {away_team}")
    print("-" * 40)
    print(f"{home_team:<20} : {probabilities['home']:.2%}")
    print(f"{'Draw':<20} : {probabilities['draw']:.2%}")
    print(f"{away_team:<20} : {probabilities['away']:.2%}")
    print(f"\nPrediction: {result['prediction']['label']}")


if __name__ == "__main__":
    _print_prediction(predict_match("Paris SG", "Marseille"))
