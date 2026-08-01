from src.api.client import api


def get_matches(competition_code, season=None, status=None):
    endpoint = f"competitions/{competition_code}/matches"

    params = {}

    if season is not None:
        params["season"] = season

    if status is not None:
        params["status"] = status

    data = api.get(endpoint, params=params)

    return data.get("matches", [])