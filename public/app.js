const form = document.querySelector("#prediction-form");
const homeSelect = document.querySelector("#home-team");
const awaySelect = document.querySelector("#away-team");
const submitButton = document.querySelector("#predict-button");
const swapButton = document.querySelector("#swap-teams");
const results = document.querySelector("#results");
const errorMessage = document.querySelector("#form-error");

const teamPalette = [
  "#d7ff54",
  "#74e6bd",
  "#76a9ff",
  "#ffb85c",
  "#f388a5",
  "#bba2ff",
];

function initials(team) {
  const aliases = {
    "Paris SG": "PSG",
    "Paris FC": "PFC",
    Marseille: "OM",
    Monaco: "ASM",
    Lyon: "OL",
    Lille: "LOSC",
    "Le Havre": "HAC",
    "St Etienne": "ASSE",
  };

  if (aliases[team]) return aliases[team];
  return team
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function teamColor(team) {
  const hash = [...team].reduce((total, character) => total + character.charCodeAt(0), 0);
  return teamPalette[hash % teamPalette.length];
}

function paintCrest(element, team) {
  element.textContent = initials(team);
  element.style.setProperty("--crest-color", teamColor(team));
}

function syncCrests() {
  paintCrest(document.querySelector("#home-crest"), homeSelect.value);
  paintCrest(document.querySelector("#away-crest"), awaySelect.value);
}

function setOptions(select, teams, preferredTeam) {
  select.replaceChildren(
    ...teams.map((team) => {
      const option = document.createElement("option");
      option.value = team;
      option.textContent = team;
      option.selected = team === preferredTeam;
      return option;
    }),
  );
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.classList.toggle("is-loading", isLoading);
  submitButton.querySelector(".button-label").textContent = isLoading
    ? "Analyse en cours"
    : "Lancer l’analyse";
}

function formatProbability(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function renderResults(data) {
  const { home_team: homeTeam, away_team: awayTeam, probabilities, prediction } = data;
  const predictionKey = { H: "home", D: "draw", A: "away" }[prediction.class];

  document.querySelector("#fixture-label").textContent = `${homeTeam} — ${awayTeam}`;
  document.querySelector("#home-result-label").textContent = homeTeam;
  document.querySelector("#away-result-label").textContent = awayTeam;
  document.querySelector("#winner-label").textContent = prediction.label;

  const winnerCrest = document.querySelector("#winner-crest");
  winnerCrest.classList.toggle("is-draw", prediction.class === "D");
  paintCrest(winnerCrest, prediction.class === "D" ? "Nul" : prediction.label);

  const bestProbability = probabilities[predictionKey];
  document.querySelector("#confidence-copy").textContent =
    `${formatProbability(bestProbability)} de probabilité selon le modèle`;

  for (const outcome of ["home", "draw", "away"]) {
    document.querySelector(`#${outcome}-probability`).textContent =
      formatProbability(probabilities[outcome]);
    document.querySelector(`[data-outcome="${outcome}"]`).classList.toggle(
      "is-winner",
      outcome === predictionKey,
    );
  }

  results.hidden = false;
  results.classList.remove("is-visible");
  window.requestAnimationFrame(() => {
    results.classList.add("is-visible");
    window.requestAnimationFrame(() => {
      for (const outcome of ["home", "draw", "away"]) {
        document.querySelector(`#${outcome}-bar`).style.width =
          `${probabilities[outcome] * 100}%`;
      }
    });
  });
}

async function requestPrediction({ scroll = true } = {}) {
  clearError();

  if (homeSelect.value === awaySelect.value) {
    showError("Sélectionnez deux équipes différentes.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        home_team: homeSelect.value,
        away_team: awaySelect.value,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "La prédiction n’a pas pu être calculée.");
    }

    renderResults(data);
    if (scroll && window.innerWidth < 780) {
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (error) {
    showError(error.message || "Le service est momentanément indisponible.");
  } finally {
    setLoading(false);
  }
}

async function initialize() {
  try {
    const response = await fetch("/api/teams");
    if (!response.ok) throw new Error();
    const { teams } = await response.json();

    setOptions(homeSelect, teams, teams.includes("Paris SG") ? "Paris SG" : teams[0]);
    setOptions(
      awaySelect,
      teams,
      teams.includes("Marseille") ? "Marseille" : teams.find((team) => team !== homeSelect.value),
    );

    homeSelect.disabled = false;
    awaySelect.disabled = false;
    submitButton.disabled = false;
    syncCrests();
    await requestPrediction({ scroll: false });
  } catch {
    showError("Impossible de charger les équipes. Réessayez dans quelques instants.");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  requestPrediction();
});

homeSelect.addEventListener("change", syncCrests);
awaySelect.addEventListener("change", syncCrests);

swapButton.addEventListener("click", () => {
  const homeTeam = homeSelect.value;
  homeSelect.value = awaySelect.value;
  awaySelect.value = homeTeam;
  syncCrests();
  clearError();
});

initialize();
