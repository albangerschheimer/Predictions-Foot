# ⚽ Ligue 1 Match Predictor

A Machine Learning project that predicts the outcome of French Ligue 1 football matches using historical match data, recent team form, offensive and defensive statistics, Elo ratings, and other engineered features.

The model predicts three possible outcomes:

- 🏠 **H** — Home win
- 🤝 **D** — Draw
- ✈️ **A** — Away win

The project covers the complete Data Science workflow: data collection, preprocessing, feature engineering, model training, evaluation, and match prediction.

---

## 🎯 Project Goal

The objective of this project is to answer a simple question:

> **Can historical football data be used to predict the result of a Ligue 1 match?**

Instead of using only the team names, the model tries to estimate the relative strength and recent performance of both teams before each match.

For example:

```text
⚽ Paris SG vs Marseille
----------------------------------------

Marseille            : 10.29%
Draw                 : 16.73%
Paris SG             : 72.98%

🎯 Prediction: Paris SG
```

---

# 📊 Dataset

The project uses historical French Ligue 1 match data from:

**Football-Data.co.uk**

The dataset currently contains Ligue 1 seasons from:

- 2021-2022
- 2022-2023
- 2023-2024
- 2024-2025
- 2025-2026

Approximately **1,678 matches** are used before feature preprocessing.

The original match data includes information such as:

```text
Date
HomeTeam
AwayTeam
FTHG
FTAG
FTR
Season
```

Where:

| Variable | Meaning |
|---|---|
| `FTHG` | Full Time Home Goals |
| `FTAG` | Full Time Away Goals |
| `FTR` | Full Time Result |
| `H` | Home win |
| `D` | Draw |
| `A` | Away win |

---

# 🧠 Feature Engineering

Raw match results are not enough to build a useful prediction model.

Several features were therefore calculated using only information available **before each match**.

This is important because using information from the match being predicted would create **data leakage**.

## Recent Form

The model calculates the performance of each team over its previous five matches.

Examples:

```text
home_form_last5
away_form_last5
```

Points are calculated using the standard football system:

```text
Win  = 3 points
Draw = 1 point
Loss = 0 points
```

---

## ⚽ Offensive Performance

The average number of goals scored over the previous five matches:

```text
home_goals_scored_last5
away_goals_scored_last5
```

---

## 🛡️ Defensive Performance

The average number of goals conceded over the previous five matches:

```text
home_goals_conceded_last5
away_goals_conceded_last5
```

---

## 📈 Comparative Features

Additional variables compare the two teams directly.

Examples:

```text
form_diff
attack_diff
defense_diff
home_attack_vs_away_defense
away_attack_vs_home_defense
```

These features help the model understand the difference in strength between the two opponents.

---

# ♟️ Elo Rating

One of the most important improvements to the project was the implementation of an **Elo rating system**.

Every team starts with an Elo rating and gains or loses points after each match depending on:

- its previous rating
- the opponent's rating
- the match result
- home advantage

The following features are generated:

```text
home_elo
away_elo
elo_diff
```

Elo significantly improved the prediction performance of the model.

Before Elo, the best models achieved approximately:

```text
45% accuracy
```

After adding Elo:

```text
~50% accuracy
```

---

# 🏟️ Home and Away Form

The project also experimented with venue-specific performance.

Features such as:

```text
home_points_at_home_last5
away_points_away_last5
```

were created to measure how teams perform specifically at home or away.

These features were tested but did not significantly improve the final model.

This is an important part of the Machine Learning workflow: not every new feature improves performance.

---

# 📊 Points Per Game

Another experiment introduced long-term team performance using Points Per Game:

```text
home_ppg
away_ppg
ppg_diff
```

These features provide information about the overall historical performance of each team.

They were evaluated alongside the existing form and Elo features.

---

# 🤖 Machine Learning Models

Several classification algorithms were compared using the same chronological train/test split.

The models tested were:

- Logistic Regression
- Random Forest
- Gradient Boosting
- Histogram Gradient Boosting

## Results

| Model | Accuracy |
|---|---:|
| 🥇 Logistic Regression | **49.84%** |
| Random Forest | 47.66% |
| Gradient Boosting | 47.04% |
| Histogram Gradient Boosting | 44.55% |

The final selected model is:

## 🏆 Logistic Regression — 49.84% accuracy

A more complex algorithm did not automatically produce better predictions.

For this dataset and the available features, Logistic Regression generalized better than the tested ensemble models.

---

# ⚠️ Predicting Draws

One of the main difficulties discovered during the project was predicting draws.

Football results are naturally imbalanced, and the model tends to predict home or away wins more often than draws.

Several approaches were tested, including:

```text
class_weight="balanced"
```

and custom probability thresholds for draws.

These approaches increased the number of draw predictions but reduced overall accuracy.

This remains one of the main areas for future improvement.

---

# 🔮 Match Prediction

After training, the final model is saved using `joblib`:

```text
models/football_model.pkl
```

The feature configuration is also saved:

```text
models/features.pkl
```

The prediction script loads these files and calculates probabilities for a match.

Example:

```bash
python src/models/predict.py
```

Example output:

```text
⚽ Paris SG vs Marseille
----------------------------------------

Marseille            : 10.29%
Draw                 : 16.73%
Paris SG             : 72.98%

🎯 Prediction: Paris SG
```

---

# 📁 Project Structure

```text
Predictions-Foot/
│
├── data/
│   ├── raw/
│   └── processed/
│       └── ligue1_features.csv
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
├── requirements.txt
├── .gitignore
└── README.md
```

---

# 🛠️ Technologies

The project was developed with:

- Python
- Pandas
- NumPy
- Scikit-learn
- Joblib
- Git
- GitHub

Machine Learning techniques used include:

- Data preprocessing
- Feature engineering
- Classification
- Logistic Regression
- Random Forest
- Gradient Boosting
- Feature scaling
- Elo ratings
- Chronological train/test splitting
- Model evaluation

---

# 🚀 Running the Project

Clone the repository:

```bash
git clone <repository-url>
cd Predictions-Foot
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Train the models:

```bash
python src/models/train_model.py
```

Run a prediction:

```bash
python src/models/predict.py
```

---

# 🧪 How I Built This Project

This project was built progressively rather than starting directly with a complex Machine Learning model.

## 1. Data Collection

I first explored several football APIs to obtain recent Ligue 1 data.

During this process, I encountered limitations such as:

- API request limits
- restricted competitions
- subscription requirements
- HTTP 403 errors
- unavailable historical data

I eventually chose historical CSV football data because it provided enough matches to train and evaluate a Machine Learning model without depending on a paid API.

---

## 2. Data Preparation

I combined multiple Ligue 1 seasons into a single dataset.

The initial dataset was cleaned and reduced to the variables required for the project.

I also converted dates and ensured matches were processed chronologically.

---

## 3. First Machine Learning Model

I created a first baseline model using simple match and form features.

The initial accuracy was approximately:

```text
42.56%
```

This baseline gave me a reference point for evaluating future improvements.

---

## 4. Recent Team Form

I then calculated statistics using each team's previous five matches.

This included:

- recent points
- goals scored
- goals conceded

A major challenge was making sure the current match was added to the team's history **after** calculating its features.

Otherwise, the model would have access to future information.

---

## 5. Feature Engineering

I created additional comparative features such as:

```text
form_diff
attack_diff
defense_diff
```

This allowed the model to compare both teams directly instead of analyzing their statistics independently.

---

## 6. Elo Rating System

I implemented an Elo rating system to estimate the historical strength of every team.

This became one of the most useful features in the project.

After adding Elo, model accuracy increased to approximately:

```text
49%
```

---

## 7. Model Experiments

I tested different Machine Learning approaches.

I experimented with:

- Random Forest
- Logistic Regression
- class balancing
- draw probability thresholds
- StandardScaler
- Gradient Boosting
- Histogram Gradient Boosting

Some experiments improved specific classes but reduced overall accuracy.

Instead of keeping every modification, I compared the models using the same test data.

---

## 8. Model Selection

The final comparison produced:

```text
Logistic Regression      49.84%
Random Forest            47.66%
Gradient Boosting        47.04%
Hist Gradient Boosting   44.55%
```

Logistic Regression was therefore selected as the final model.

---

## 9. Model Persistence

Instead of retraining the model every time a prediction is requested, I saved the trained model using Joblib.

The application can now load the trained model directly and generate predictions.

---

## 10. Prediction System

Finally, I created a prediction script that takes two teams and returns the probabilities of:

```text
Home win
Draw
Away win
```

This transformed the project from a simple Machine Learning experiment into a reusable prediction system.

---

# 📚 What I Learned

This project helped me understand the complete workflow of a Machine Learning project.

In particular, I learned how to:

- collect and clean real-world data
- work with Pandas DataFrames
- process chronological datasets
- avoid data leakage
- create features from historical observations
- implement an Elo rating system
- train classification models
- understand accuracy, precision, recall and F1-score
- compare several Machine Learning algorithms
- deal with imbalanced classes
- scale numerical features
- save and reload trained models
- structure a Python Data Science project
- use Git and GitHub to manage a project

One of the most important lessons from this project is that **better data and better features can matter more than using a more complicated Machine Learning algorithm**.

---

# 🔮 Future Improvements

Possible future improvements include:

- adding current Ligue 1 standings
- expected goals (xG)
- injuries and suspensions
- player statistics
- head-to-head statistics
- separate home/away ratings
- improved draw prediction
- hyperparameter optimization
- probability calibration
- more historical seasons
- automatic updates with recent matches
- web interface for predictions
- deployment on Vercel

---

# ⚠️ Disclaimer

This project was created for educational and Data Science purposes.

Football matches contain a large amount of randomness and external factors that are not represented in the dataset.

The predictions should therefore not be considered betting advice.

---

## 👤 Author

**Alban**

Student project focused on Data Science, Machine Learning and football analytics.
