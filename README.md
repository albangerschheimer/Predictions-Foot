# Ligue 1 Match Predictor ⚽

Projet de Machine Learning permettant de prédire le résultat d'un match de Ligue 1 à partir des performances passées des équipes.

## Transparence sur l’IA

Ce projet a été réalisé avec l’aide de **GPT-5.5**. Le modèle a servi d’assistant pendant la conception et l’implémentation ; les choix, les vérifications et la responsabilité du résultat restent humains.

Le modèle estime les probabilités de trois résultats :

- Victoire de l'équipe à domicile
- Match nul
- Victoire de l'équipe à l'extérieur

## 🌐 Démo

Le projet est disponible en ligne :

👉 [pronostic-foot.vercel.app](https://pronostic-foot.vercel.app/)

Il suffit de choisir l'équipe à domicile et l'équipe à l'extérieur pour obtenir les probabilités calculées par le modèle.

Exemple :

```text
Paris SG vs Marseille

Paris SG     : 72.98%
Match nul    : 16.73%
Marseille    : 10.29%

Prédiction : Paris SG
```

---

## Objectif

L'objectif de ce projet était de construire un projet Data Science complet autour du football :

1. Récupérer des données réelles de Ligue 1
2. Nettoyer et préparer les données
3. Créer des variables utiles pour représenter la forme des équipes
4. Entraîner plusieurs modèles de Machine Learning
5. Comparer leurs performances
6. Créer un système capable de prédire un nouveau match
7. Mettre le modèle à disposition dans une application web

---

## Données

Les données utilisées proviennent de **Football-Data.co.uk**.

Le dataset regroupe plusieurs saisons de Ligue 1 :

- 2021-2022
- 2022-2023
- 2023-2024
- 2024-2025
- 2025-2026

Cela représente environ **1 678 matchs** avant le traitement des données.

Les données de base contiennent notamment :

```text
Date
HomeTeam
AwayTeam
FTHG
FTAG
FTR
Season
```

Avec :

| Variable | Description |
|---|---|
| `FTHG` | Nombre de buts de l'équipe à domicile |
| `FTAG` | Nombre de buts de l'équipe à l'extérieur |
| `FTR` | Résultat final |
| `H` | Victoire à domicile |
| `D` | Match nul |
| `A` | Victoire à l'extérieur |

---

## Feature Engineering

Une partie importante du projet a été de créer des informations permettant de représenter le niveau des deux équipes **avant le match**.

### Forme récente

Pour chaque équipe, j'ai calculé les résultats sur les 5 derniers matchs :

```text
home_form_last5
away_form_last5
```

Le système de points utilisé est :

```text
Victoire = 3
Nul      = 1
Défaite  = 0
```

### Attaque et défense

J'ai également calculé les moyennes de buts marqués et encaissés sur les derniers matchs :

```text
home_goals_scored_last5
away_goals_scored_last5

home_goals_conceded_last5
away_goals_conceded_last5
```

### Comparaison des équipes

D'autres variables permettent de comparer directement les deux équipes :

```text
form_diff
attack_diff
defense_diff
home_attack_vs_away_defense
away_attack_vs_home_defense
```

---

## Elo Rating

J'ai ensuite ajouté un système de classement **Elo**.

Chaque équipe possède un score qui évolue après chaque match selon :

- son niveau avant le match
- le niveau de son adversaire
- le résultat du match
- l'avantage du terrain

Les principales variables sont :

```text
home_elo
away_elo
elo_diff
```

L'ajout de l'Elo a été une des améliorations les plus importantes du projet.

Avant son ajout, les modèles tournaient autour de **45 % d'accuracy**.

Après son ajout, les performances sont montées autour de **50 %**.

---

## Points par match

J'ai également testé des statistiques de performance plus générales :

```text
home_ppg
away_ppg
ppg_diff
```

PPG signifie **Points Per Game**.

Cela permet de représenter les performances d'une équipe sur une période plus longue que les 5 derniers matchs.

---

## Modèles testés

J'ai comparé plusieurs algorithmes sur les mêmes données :

| Modèle | Accuracy |
|---|---:|
| **Logistic Regression** | **49.84 %** |
| Random Forest | 47.66 % |
| Gradient Boosting | 47.04 % |
| Hist Gradient Boosting | 44.55 % |

Le modèle finalement retenu est donc :

### Logistic Regression — 49.84 %

Un point intéressant du projet est qu'un modèle plus complexe n'a pas forcément donné de meilleurs résultats.

La Logistic Regression a obtenu les meilleures performances parmi les modèles testés.

---

## Difficulté des matchs nuls

Une des principales limites du modèle concerne les matchs nuls.

Le modèle arrive beaucoup mieux à reconnaître les victoires à domicile ou à l'extérieur que les nuls.

J'ai testé plusieurs solutions, notamment :

- le rééquilibrage des classes
- des seuils de probabilité spécifiques
- différents modèles

Ces méthodes permettaient parfois de détecter plus de nuls, mais réduisaient l'accuracy globale.

C'est donc un des principaux points qui pourrait être amélioré dans une future version.

---

## Comment j'ai créé le projet

Je n'ai pas construit directement le modèle final. Le projet a évolué progressivement.

### 1. Recherche des données

Au début, j'ai testé plusieurs API de football.

J'ai rencontré plusieurs problèmes :

- limites de requêtes
- compétitions bloquées
- abonnements nécessaires
- erreurs HTTP 403
- données historiques limitées

J'ai finalement utilisé les fichiers CSV de Football-Data.co.uk pour avoir suffisamment de matchs gratuitement.

### 2. Préparation du dataset

J'ai regroupé plusieurs saisons de Ligue 1 dans un seul dataset puis conservé les informations nécessaires.

J'ai également trié les matchs chronologiquement.

### 3. Premier modèle

Le premier modèle obtenait environ :

```text
42.56 % d'accuracy
```

Ce résultat m'a servi de référence pour mesurer les améliorations suivantes.

### 4. Ajout de la forme récente

J'ai créé des statistiques basées sur les 5 derniers matchs de chaque équipe :

- points obtenus
- buts marqués
- buts encaissés

Il fallait faire attention à calculer ces informations **avant le match à prédire** pour éviter que le modèle utilise le résultat futur.

### 5. Ajout des comparaisons

J'ai ensuite ajouté des variables permettant de comparer directement les deux équipes :

```text
form_diff
attack_diff
defense_diff
```

### 6. Ajout de l'Elo

J'ai créé un système Elo permettant de donner une estimation du niveau de chaque équipe.

Cette étape a permis de faire passer les performances du modèle proche des **50 %**.

### 7. Comparaison des modèles

Au lieu de garder directement un modèle, j'en ai testé plusieurs sur le même jeu de test :

```text
Logistic Regression      49.84%
Random Forest            47.66%
Gradient Boosting        47.04%
Hist Gradient Boosting   44.55%
```

La Logistic Regression a donc été conservée.

### 8. Sauvegarde du modèle

Le modèle entraîné est sauvegardé avec **Joblib** :

```text
models/football_model.pkl
```

La liste des features utilisées est également sauvegardée :

```text
models/features.pkl
```

Cela permet de faire des prédictions sans réentraîner le modèle à chaque fois.

### 9. Système de prédiction

J'ai ensuite créé un script permettant de choisir deux équipes et d'obtenir les probabilités :

```text
Victoire domicile
Match nul
Victoire extérieur
```

### 10. Application web

Enfin, j'ai créé une interface web pour rendre le modèle facilement utilisable.

L'application est déployée sur Vercel :

👉 [pronostic-foot.vercel.app](https://pronostic-foot.vercel.app/)

---

## Structure du projet

```text
Predictions-Foot/
│
├── data/
│   ├── raw/
│   └── processed/
│
├── models/
│   ├── football_model.pkl
│   └── features.pkl
│
├── src/
│   ├── features/
│   │   ├── build_features.py
│   │   ├── team_form.py
│   │   ├── elo_features.py
│   │   └── season_strength.py
│   │
│   └── models/
│       ├── train_model.py
│       └── predict.py
│
├── README.md
├── requirements.txt
└── .gitignore
```

---

## Technologies utilisées

- Python
- Pandas
- NumPy
- Scikit-learn
- Joblib
- Git
- GitHub
- Vercel

---

## Lancer le projet

### Cloner le repository

```bash
git clone <URL_DU_REPOSITORY>
cd Predictions-Foot
```

### Créer l'environnement virtuel

```bash
python -m venv .venv
```

### Activer l'environnement

Sur macOS / Linux :

```bash
source .venv/bin/activate
```

### Installer les dépendances

```bash
pip install -r requirements.txt
```

### Entraîner le modèle

```bash
python src/models/train_model.py
```

### Faire une prédiction

```bash
python src/models/predict.py
```

---

## Ce que j'ai appris

Ce projet m'a surtout permis de pratiquer un projet Data Science du début à la fin.

J'ai notamment travaillé sur :

- la récupération de données réelles
- Pandas et la manipulation de DataFrames
- le nettoyage des données
- la création de features
- les données temporelles
- le problème du data leakage
- les modèles de classification
- Logistic Regression
- Random Forest
- Gradient Boosting
- l'accuracy, la precision, le recall et le F1-score
- le scaling des variables
- le système Elo
- la comparaison de plusieurs modèles
- la sauvegarde d'un modèle entraîné
- Git et GitHub
- le déploiement d'une application web

Ce projet m'a aussi montré qu'en Machine Learning, **ajouter un modèle plus complexe ne signifie pas forcément obtenir de meilleures prédictions**. La qualité des données et des features est très importante.

---

## Améliorations possibles

Le projet pourrait encore être amélioré avec :

- plus de saisons
- les Expected Goals (xG)
- les blessures
- les compositions d'équipes
- les statistiques des joueurs
- le classement actuel
- les confrontations directes
- une meilleure gestion des matchs nuls
- l'optimisation des hyperparamètres
- la mise à jour automatique des nouveaux matchs

---

## Limites

Une accuracy de **49.84 %** signifie évidemment que le modèle est encore loin de pouvoir prédire parfaitement un match de football.

Le football dépend de nombreux éléments qui ne sont pas présents dans les données utilisées : blessures, cartons, tactique, compositions, forme individuelle des joueurs, etc.

Ce projet a donc principalement un objectif **Data Science et Machine Learning** et non un objectif de paris sportifs.

---

## Auteur

**Alban**

Projet personnel autour de la Data Science, du Machine Learning et du football.
