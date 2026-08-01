# Predictions-Foot

Application web de prédiction des matchs de Ligue 1. Elle réutilise le modèle
scikit-learn entraîné du projet pour estimer les probabilités d'une victoire à
domicile (`H`), d'un nul (`D`) ou d'une victoire à l'extérieur (`A`).

## Lancer le projet localement

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app:app --reload
```

Ouvrez ensuite <http://127.0.0.1:8000>.

## API

- `GET /api/health` vérifie que l'application répond.
- `GET /api/teams` renvoie les clubs de la saison la plus récente.
- `POST /api/predict` calcule les probabilités d'un match.

Exemple de requête :

```json
{
  "home_team": "Paris SG",
  "away_team": "Marseille"
}
```

Les probabilités de la réponse sont des nombres décimaux compris entre 0 et 1.

## Déployer sur Vercel

Le runtime Python est fixé dans `.python-version` et Vercel détecte directement
l'application FastAPI exportée par `app.py`.

1. Poussez le dépôt sur GitHub, avec `models/*.pkl` et
   `data/processed/ligue1_features.csv`.
2. Importez le dépôt dans Vercel.
3. Gardez les réglages de build par défaut puis lancez le déploiement.

Avec la CLI Vercel, la même opération se fait depuis la racine du projet :

```bash
vercel deploy
```

## Tests

```bash
python -m unittest discover -s tests -v
```

Le test de référence vérifie notamment que `Paris SG` contre `Marseille`
conserve les probabilités produites par le script d'origine.
