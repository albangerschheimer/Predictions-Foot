<div align="center">

# Ligue 1 Match Predictor ⚽

**Predicting the outcome of a Ligue 1 match from the two teams' past performance.**

[![CI](https://github.com/albangerschheimer/Predictions-Foot/actions/workflows/ci.yml/badge.svg)](https://github.com/albangerschheimer/Predictions-Foot/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.14](https://img.shields.io/badge/Python-3.14-3776AB.svg)](https://www.python.org/)
[![Live demo](https://img.shields.io/badge/demo-pronostic--foot.vercel.app-black.svg)](https://pronostic-foot.vercel.app/)

**Language / Langue — [English](#english) · [Français](#français)**

</div>

---

<a id="english"></a>

## English

An end-to-end data science project: collect real Ligue 1 results, engineer
pre-match features, compare several classifiers, and serve the winner from a
FastAPI web app.

The model returns probabilities for three outcomes — home win, draw, away win.

### Live demo

👉 **[pronostic-foot.vercel.app](https://pronostic-foot.vercel.app/)**

Pick a home team and an away team to get the model's probabilities.

```text
Paris SG vs Marseille

Paris SG     : 72.98%
Draw         : 16.73%
Marseille    : 10.29%

Prediction: Paris SG
```

### Data

Results come from **[Football-Data.co.uk](https://www.football-data.co.uk/)** and
cover five Ligue 1 seasons — 2021-22 through 2025-26 — about **1,678 matches**
before cleaning.

| Column | Meaning |
| --- | --- |
| `FTHG` | Full-time home goals |
| `FTAG` | Full-time away goals |
| `FTR` | Full-time result: `H` home win, `D` draw, `A` away win |

### Feature engineering

Every feature is computed from matches played **before** the fixture, which is
what keeps the training set free of leakage.

| Group | Features |
| --- | --- |
| Recent form (last 5) | `home_form_last5`, `away_form_last5` — win 3, draw 1, loss 0 |
| Attack & defence | `home_goals_scored_last5`, `away_goals_scored_last5`, `home_goals_conceded_last5`, `away_goals_conceded_last5` |
| Head-to-head deltas | `form_diff`, `attack_diff`, `defense_diff`, `home_attack_vs_away_defense`, `away_attack_vs_home_defense` |
| Elo rating | `home_elo`, `away_elo`, `elo_diff` |
| Points per game | `home_ppg`, `away_ppg`, `ppg_diff` |

**Elo was the single biggest win.** Each team carries a rating that moves after
every match according to its level, its opponent's level, the result, and home
advantage. Before Elo the models sat around **45% accuracy**; after it, around
**50%**.

### Results

| Model | Accuracy |
| --- | ---: |
| **Logistic Regression** *(selected)* | **49.84%** |
| Random Forest | 47.66% |
| Gradient Boosting | 47.04% |
| Hist Gradient Boosting | 44.55% |

The interesting finding: the more complex model did not win. Logistic Regression
beat every tree ensemble on the same features.

**Draws are the hard part.** The model separates home and away wins far better
than draws. Class rebalancing, custom probability thresholds and different
algorithms each surfaced more draws but cost overall accuracy, so none were kept.
This is the main thing a future version should fix.

### Limitations

49.84% accuracy means the model is nowhere near predicting football reliably.
Injuries, cards, tactics, line-ups and individual form are simply not in the
data. **This is a data science and machine learning exercise, not a betting
tool.**

### Project structure

```text
Predictions-Foot/
├── app.py                     # FastAPI app served on Vercel
├── data/
│   ├── raw/                   # Downloaded season CSVs (git-ignored)
│   └── processed/             # ligue1_features.csv, the model input
├── models/
│   ├── football_model.pkl     # Trained Logistic Regression
│   └── features.pkl           # Feature order expected at inference
├── public/                    # Static front-end assets
├── scripts/
│   ├── build_dataset.py       # Download and merge the season CSVs
│   └── check_api.py           # Probe the football-data.org API
├── src/
│   ├── api/                   # API-Football client
│   ├── features/              # build_features, team_form, elo_features, season_strength
│   └── models/                # train_model, predict
├── tests/                     # Unit tests (run by CI)
├── requirements.txt
└── .env.example
```

### Running it

```bash
git clone https://github.com/albangerschheimer/Predictions-Foot.git
cd Predictions-Foot

python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

pip install -r requirements.txt
```

Train the model (optional — a trained model is committed):

```bash
python -m src.models.train_model
```

Predict a fixture:

```bash
python -c "from src.models.predict import predict_match; print(predict_match('Paris SG', 'Marseille'))"
```

Serve the web app locally:

```bash
uvicorn app:app --reload
```

Run the tests:

```bash
python -m unittest discover -s tests -t .
```

No API key is needed for any of the above: training, prediction and the web app
all read the committed CSV and `.pkl` files. Keys are only required by the
helper scripts in `scripts/` — see [.env.example](.env.example).

### Tech stack

Python · pandas · NumPy · scikit-learn · SciPy · joblib · FastAPI · Uvicorn · Vercel

### Possible improvements

More seasons · expected goals (xG) · injuries · line-ups · player statistics ·
current standings · head-to-head history · better draw handling ·
hyperparameter tuning · automatic ingestion of new matches

### AI transparency

This project was built with the help of **GPT-5.5**. The model acted as an
assistant during design and implementation; the choices, the verification and
the responsibility for the result remain human.

### License

[MIT](LICENSE) © 2026 Alban Gerschheimer. Match data belongs to
Football-Data.co.uk and is subject to their terms.

---

<a id="français"></a>

## Français

Un projet de data science de bout en bout : récupérer de vrais résultats de
Ligue 1, construire des variables d'avant-match, comparer plusieurs
classifieurs, et servir le meilleur depuis une application web FastAPI.

Le modèle renvoie les probabilités de trois résultats — victoire à domicile,
match nul, victoire à l'extérieur.

### Démo en ligne

👉 **[pronostic-foot.vercel.app](https://pronostic-foot.vercel.app/)**

Choisissez l'équipe à domicile et l'équipe à l'extérieur pour obtenir les
probabilités calculées par le modèle.

```text
Paris SG vs Marseille

Paris SG     : 72.98%
Match nul    : 16.73%
Marseille    : 10.29%

Prédiction : Paris SG
```

### Données

Les résultats proviennent de
**[Football-Data.co.uk](https://www.football-data.co.uk/)** et couvrent cinq
saisons de Ligue 1 — 2021-2022 à 2025-2026 — soit environ **1 678 matchs** avant
nettoyage.

| Colonne | Signification |
| --- | --- |
| `FTHG` | Buts de l'équipe à domicile |
| `FTAG` | Buts de l'équipe à l'extérieur |
| `FTR` | Résultat final : `H` domicile, `D` nul, `A` extérieur |

### Feature engineering

Chaque variable est calculée à partir des matchs joués **avant** la rencontre,
c'est ce qui évite le data leakage.

| Groupe | Variables |
| --- | --- |
| Forme récente (5 derniers) | `home_form_last5`, `away_form_last5` — victoire 3, nul 1, défaite 0 |
| Attaque & défense | `home_goals_scored_last5`, `away_goals_scored_last5`, `home_goals_conceded_last5`, `away_goals_conceded_last5` |
| Comparaison directe | `form_diff`, `attack_diff`, `defense_diff`, `home_attack_vs_away_defense`, `away_attack_vs_home_defense` |
| Classement Elo | `home_elo`, `away_elo`, `elo_diff` |
| Points par match | `home_ppg`, `away_ppg`, `ppg_diff` |

**L'Elo a été la plus grosse amélioration.** Chaque équipe porte un score qui
évolue après chaque match selon son niveau, celui de l'adversaire, le résultat et
l'avantage du terrain. Avant l'Elo, les modèles tournaient autour de **45 %
d'accuracy** ; après, autour de **50 %**.

### Résultats

| Modèle | Accuracy |
| --- | ---: |
| **Logistic Regression** *(retenu)* | **49,84 %** |
| Random Forest | 47,66 % |
| Gradient Boosting | 47,04 % |
| Hist Gradient Boosting | 44,55 % |

Le constat intéressant : le modèle le plus complexe n'a pas gagné. La régression
logistique a battu tous les ensembles d'arbres sur les mêmes variables.

**Les matchs nuls sont le point dur.** Le modèle distingue bien mieux les
victoires à domicile et à l'extérieur que les nuls. Rééquilibrage des classes,
seuils de probabilité spécifiques et autres algorithmes faisaient parfois
remonter des nuls, mais au prix de l'accuracy globale : aucun n'a été retenu.
C'est le principal chantier d'une version future.

### Limites

49,84 % d'accuracy, cela veut dire que le modèle est encore loin de prédire un
match de football de façon fiable. Blessures, cartons, tactique, compositions et
forme individuelle ne sont tout simplement pas dans les données. **C'est un
exercice de data science et de machine learning, pas un outil de paris.**

### Structure du projet

```text
Predictions-Foot/
├── app.py                     # Application FastAPI déployée sur Vercel
├── data/
│   ├── raw/                   # CSV des saisons téléchargés (git-ignoré)
│   └── processed/             # ligue1_features.csv, l'entrée du modèle
├── models/
│   ├── football_model.pkl     # Régression logistique entraînée
│   └── features.pkl           # Ordre des variables attendu à l'inférence
├── public/                    # Ressources statiques du front
├── scripts/
│   ├── build_dataset.py       # Télécharge et fusionne les CSV de saison
│   └── check_api.py           # Teste l'API football-data.org
├── src/
│   ├── api/                   # Client API-Football
│   ├── features/              # build_features, team_form, elo_features, season_strength
│   └── models/                # train_model, predict
├── tests/                     # Tests unitaires (exécutés par la CI)
├── requirements.txt
└── .env.example
```

### Lancer le projet

```bash
git clone https://github.com/albangerschheimer/Predictions-Foot.git
cd Predictions-Foot

python -m venv .venv
source .venv/bin/activate          # Windows : .venv\Scripts\activate

pip install -r requirements.txt
```

Entraîner le modèle (facultatif — un modèle entraîné est versionné) :

```bash
python -m src.models.train_model
```

Prédire un match :

```bash
python -c "from src.models.predict import predict_match; print(predict_match('Paris SG', 'Marseille'))"
```

Servir l'application en local :

```bash
uvicorn app:app --reload
```

Lancer les tests :

```bash
python -m unittest discover -s tests -t .
```

Aucune clé d'API n'est nécessaire pour tout ce qui précède : l'entraînement, la
prédiction et l'application web lisent les CSV et les `.pkl` versionnés. Les clés
ne servent qu'aux scripts de `scripts/` — voir [.env.example](.env.example).

### Technologies

Python · pandas · NumPy · scikit-learn · SciPy · joblib · FastAPI · Uvicorn · Vercel

### Améliorations possibles

Plus de saisons · Expected Goals (xG) · blessures · compositions · statistiques
des joueurs · classement actuel · confrontations directes · meilleure gestion des
nuls · optimisation des hyperparamètres · mise à jour automatique des nouveaux
matchs

### Transparence sur l'IA

Ce projet a été réalisé avec l'aide de **GPT-5.5**. Le modèle a servi d'assistant
pendant la conception et l'implémentation ; les choix, les vérifications et la
responsabilité du résultat restent humains.

### Licence

[MIT](LICENSE) © 2026 Alban Gerschheimer. Les données de matchs appartiennent à
Football-Data.co.uk et restent soumises à leurs conditions.

---

*Dernière mise à jour : novembre 2026.*
