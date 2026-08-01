import pandas as pd
import joblib

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingClassifier,
    HistGradientBoostingClassifier,
)

from sklearn.metrics import (
    accuracy_score,
    classification_report,
)


# =========================
# 1. Charger les données
# =========================

df = pd.read_csv(
    "data/processed/ligue1_features.csv"
)


# =========================
# 2. Features nécessaires
# =========================

features_base = [
    "home_form_last5",
    "away_form_last5",
    "home_goals_scored_last5",
    "away_goals_scored_last5",
    "home_goals_conceded_last5",
    "away_goals_conceded_last5",
    "home_elo",
    "away_elo",
    "elo_diff",
    "home_ppg",
"away_ppg",
"ppg_diff",
]

df = df.dropna(
    subset=features_base
).copy()


# =========================
# 3. Features comparatives
# =========================

df["form_diff"] = (
    df["home_form_last5"]
    - df["away_form_last5"]
)

df["attack_diff"] = (
    df["home_goals_scored_last5"]
    - df["away_goals_scored_last5"]
)

df["defense_diff"] = (
    df["away_goals_conceded_last5"]
    - df["home_goals_conceded_last5"]
)

df["home_attack_vs_away_defense"] = (
    df["home_goals_scored_last5"]
    - df["away_goals_conceded_last5"]
)

df["away_attack_vs_home_defense"] = (
    df["away_goals_scored_last5"]
    - df["home_goals_conceded_last5"]
)


features = [
    "home_form_last5",
    "away_form_last5",

    "home_goals_scored_last5",
    "away_goals_scored_last5",

    "home_goals_conceded_last5",
    "away_goals_conceded_last5",

    "form_diff",
    "attack_diff",
    "defense_diff",

    "home_attack_vs_away_defense",
    "away_attack_vs_home_defense",

    "home_elo",
    "away_elo",
    "elo_diff",

    "home_ppg",
"away_ppg",
"ppg_diff",

]


X = df[features]
y = df["FTR"]


# =========================
# 4. Séparation chronologique
# =========================

split = int(
    len(df) * 0.80
)

X_train = X.iloc[:split]
X_test = X.iloc[split:]

y_train = y.iloc[:split]
y_test = y.iloc[split:]


print(
    f"Matchs entraînement : {len(X_train)}"
)

print(
    f"Matchs test : {len(X_test)}"
)

print()


# =========================
# 5. Modèles à comparer
# =========================

models = {

    "Logistic Regression": Pipeline([
        (
            "scaler",
            StandardScaler()
        ),
        (
            "model",
            LogisticRegression(
                max_iter=2000,
                random_state=42
            )
        ),
    ]),

    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        random_state=42
    ),

    "Gradient Boosting": GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.05,
        max_depth=3,
        random_state=42
    ),

    "Hist Gradient Boosting":
        HistGradientBoostingClassifier(
            max_iter=200,
            learning_rate=0.05,
            random_state=42
        ),
}


# =========================
# 6. Entraîner les modèles
# =========================

results = []


for name, model in models.items():

    print("=" * 50)
    print(name)
    print("=" * 50)

    model.fit(
        X_train,
        y_train
    )

    predictions = model.predict(
        X_test
    )

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    results.append({
        "model": name,
        "accuracy": accuracy
    })

    print(
        f"Accuracy : {accuracy:.2%}"
    )

    print()

    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0
        )
    )


# =========================
# 7. Classement final
# =========================

results_df = pd.DataFrame(
    results
)

results_df = results_df.sort_values(
    "accuracy",
    ascending=False
)


print()
print("=" * 50)
print("CLASSEMENT FINAL")
print("=" * 50)

for _, row in results_df.iterrows():

    print(
        f"{row['model']:<25}"
        f"{row['accuracy']:.2%}"
    )


best_model = results_df.iloc[0]

print()
print(
    f"🏆 Meilleur modèle : "
    f"{best_model['model']} "
    f"({best_model['accuracy']:.2%})"
)
# Réentraîner le meilleur modèle
best_model = models["Logistic Regression"]

best_model.fit(X_train, y_train)

# Sauvegarder le modèle
joblib.dump(
    best_model,
    "models/football_model.pkl"
)

# Sauvegarder les features utilisées
joblib.dump(
    features,
    "models/features.pkl"
)

print()
print("✅ Modèle sauvegardé dans models/football_model.pkl")