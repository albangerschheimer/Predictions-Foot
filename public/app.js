const homeSelect = document.querySelector("#home-team");
const awaySelect = document.querySelector("#away-team");
const swapButton = document.querySelector("#swap-teams");
const fixture = document.querySelector("#fixture");
const results = document.querySelector("#results");
const formGuide = document.querySelector("#form-guide");
const errorMessage = document.querySelector("#form-error");

let latestRequest = 0;

const teamAssets = {
  Angers: "angers",
  Auxerre: "auxerre",
  Brest: "brest",
  "Le Havre": "le-havre",
  Lens: "lens",
  Lille: "lille",
  Lorient: "lorient",
  Lyon: "lyon",
  Marseille: "marseille",
  Metz: "metz",
  Monaco: "monaco",
  Nantes: "nantes",
  Nice: "nice",
  "Paris FC": "paris-fc",
  "Paris SG": "paris-sg",
  Rennes: "rennes",
  Strasbourg: "strasbourg",
  Toulouse: "toulouse",
};

function paintCrest(image, team) {
  const asset = teamAssets[team];
  image.hidden = !asset;
  image.onerror = () => (image.hidden = true);
  if (asset) image.src = `/assets/teams/${asset}.png`;
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
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

function formatProbability(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

function renderRecentForm(tbody, caption, team, matches) {
  caption.textContent = team;
  tbody.replaceChildren(
    ...matches.map((match) => {
      const row = document.createElement("tr");
      const cells = [
        shortDate.format(new Date(match.date)),
        `${match.venue === "away" ? "at" : "v"} ${match.opponent}`,
        `${match.goals_for}–${match.goals_against}`,
        match.result,
      ];
      for (const text of cells) {
        const cell = document.createElement("td");
        cell.textContent = text;
        row.append(cell);
      }
      row.className = `result-${match.result.toLowerCase()}`;
      return row;
    }),
  );
}

function renderPrediction(data) {
  const { home_team: homeTeam, away_team: awayTeam, prediction, probabilities, recent_form: recentForm } = data;
  const winnerKey = { H: "home", D: "draw", A: "away" }[prediction.class];

  renderRecentForm(document.querySelector("#home-form"), document.querySelector("#home-form-title"), homeTeam, recentForm.home);
  renderRecentForm(document.querySelector("#away-form"), document.querySelector("#away-form-title"), awayTeam, recentForm.away);

  const notes = {
    home: `to win at home, ${formatProbability(probabilities.home)}`,
    draw: `Nobody wins, ${formatProbability(probabilities.draw)}`,
    away: `to win away, ${formatProbability(probabilities.away)}`,
  };
  document.querySelector("#prediction-title").textContent = winnerKey === "draw" ? "Draw" : prediction.label;
  document.querySelector("#prediction-note").textContent = notes[winnerKey];
  document.querySelector("#home-result-label").textContent = `${homeTeam} win`;
  document.querySelector("#away-result-label").textContent = `${awayTeam} win`;

  for (const outcome of ["home", "draw", "away"]) {
    document.querySelector(`#${outcome}-probability`).textContent = formatProbability(probabilities[outcome]);
    document.querySelector(`#${outcome}-bar`).style.flexGrow = probabilities[outcome];
    document.querySelector(`[data-outcome="${outcome}"]`).classList.toggle("is-winner", outcome === winnerKey);
  }

  results.hidden = false;
  formGuide.hidden = false;
}

async function updateFixture() {
  clearError();
  paintCrest(document.querySelector("#home-crest"), homeSelect.value);
  paintCrest(document.querySelector("#away-crest"), awaySelect.value);

  if (homeSelect.value === awaySelect.value) {
    results.hidden = true;
    formGuide.hidden = true;
    showError("Choose two different teams.");
    return;
  }

  const requestId = ++latestRequest;
  fixture.classList.add("is-loading");
  fixture.setAttribute("aria-busy", "true");

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
      throw new Error(data.detail || "Unable to calculate this fixture.");
    }
    if (requestId !== latestRequest) return;

    renderPrediction(data);
  } catch (error) {
    if (requestId === latestRequest) {
      showError(error.message || "The prediction service is unavailable.");
    }
  } finally {
    if (requestId === latestRequest) {
      fixture.classList.remove("is-loading");
      fixture.removeAttribute("aria-busy");
    }
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
    await updateFixture();
  } catch {
    showError("Unable to load the teams.");
  }
}

homeSelect.addEventListener("change", updateFixture);
awaySelect.addEventListener("change", updateFixture);
swapButton.addEventListener("click", () => {
  const homeTeam = homeSelect.value;
  homeSelect.value = awaySelect.value;
  awaySelect.value = homeTeam;
  updateFixture();
});

document.querySelector("#today").textContent = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

initialize();
