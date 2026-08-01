"""FastAPI entrypoint used locally and by Vercel."""

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from src.models.predict import UnknownTeamError, get_available_teams, predict_match


PROJECT_ROOT = Path(__file__).resolve().parent
PUBLIC_DIRECTORY = PROJECT_ROOT / "public"

app = FastAPI(
    title="Prono Ligue 1",
    description="Probabilités de résultats calculées par le modèle Predictions-Foot.",
    version="1.0.0",
)


class MatchRequest(BaseModel):
    home_team: str
    away_team: str


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/teams")
def teams() -> dict[str, list[str]]:
    return {"teams": get_available_teams()}


@app.post("/api/predict")
def prediction(request: MatchRequest):
    try:
        return predict_match(request.home_team, request.away_team)
    except (UnknownTeamError, ValueError) as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


# Vercel serves ``public/`` separately from the Python function bundle. Keep
# the mount for local development, but do not fail API startup when that folder
# is intentionally absent from the serverless bundle.
if PUBLIC_DIRECTORY.is_dir():
    app.mount("/", StaticFiles(directory=PUBLIC_DIRECTORY, html=True), name="public")
